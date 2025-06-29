import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useUpdateIssueField } from '../hooks/use-update-issue-field';
import { useOptimisticUpdates } from '../contexts/optimistic-updates-context';
import { useTheme, CSSThemeColors } from '../theme/theme-context';
import { SmallLoadingSpinner } from './loading-spinner';

interface DropdownOption {
  id: string;
  name: string;
  iconUrl?: string;
  avatarUrl?: string;
}

interface EditableDropdownProps {
  issueKey: string;
  fieldName: string;
  currentValue?: string | null;
  currentDisplayName?: string;
  currentIconUrl?: string;
  options: DropdownOption[];
  placeholder?: string;
  loading?: boolean;
  onUpdateSuccess?: (newValue: unknown) => void;
  onUpdateError?: (error: string) => void;
  disabled?: boolean;
  allowUnassign?: boolean; // For assignee field
}

const DropdownContainer = styled.div<{ $disabled?: boolean }>`
  position: relative;
  display: inline-block;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
`;

const DisplayValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && !prop.startsWith('$'),
})<{ $isEmpty?: boolean; $disabled?: boolean; $isUpdating?: boolean; colors?: CSSThemeColors }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.$isEmpty ? '#9ca3af' : 'inherit'};
  font-style: ${props => props.$isEmpty ? 'italic' : 'normal'};
  padding: 2px 4px;
  border-radius: 3px;
  border: 1px solid transparent;
  min-width: 20px;
  min-height: 16px;
  position: relative;
  opacity: ${props => props.$isUpdating ? 0.7 : 1};
  transition: opacity 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$disabled ? 'transparent' : (props.colors?.surface.hover || '#f3f4f6')};
    border-color: ${props => props.$disabled ? 'transparent' : (props.colors?.border.primary || '#d1d5db')};
  }
  
  &:after {
    content: ${props => props.$disabled ? 'none' : '"✏️"'};
    position: absolute;
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover:after {
    opacity: ${props => props.$disabled ? 0 : 0.6};
  }
`;

const DropdownList = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && !prop.startsWith('$'),
})<{ $isOpen?: boolean; colors?: CSSThemeColors }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  left: 0;
  background: ${props => props.colors?.surface.primary || 'white'};
  border: 2px solid ${props => props.colors?.border.focus || '#3b82f6'};
  border-radius: 3px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
`;

const DropdownOptionItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && !prop.startsWith('$'),
})<{ $isSelected?: boolean; colors?: CSSThemeColors }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  background-color: ${props => props.$isSelected ? (props.colors?.surface.active || '#eff6ff') : (props.colors?.surface.primary || 'white')};
  
  &:hover {
    background-color: ${props => props.colors?.surface.hover || '#f3f4f6'};
  }
`;

const OptionIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const OptionAvatar = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const OptionText = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors?: CSSThemeColors }>`
  font-size: 12px;
  color: ${props => props.colors?.text.primary || '#172b4d'};
`;

const LoadingText = styled.span`
  font-size: inherit;
  color: inherit;
`;

const PlaceholderText = styled.span`
  font-size: inherit;
  color: inherit;
`;

const DisplayText = styled.span`
  font-size: inherit;
  color: inherit;
`;



const ErrorMessage = styled.div`
  position: relative;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 12px;
  margin-top: 4px;
  white-space: normal;
  word-wrap: break-word;
`;

export const EditableDropdown: React.FC<EditableDropdownProps> = ({
  issueKey,
  fieldName,
  currentValue,
  currentDisplayName,
  currentIconUrl,
  options,
  placeholder = 'Click to select',
  loading = false,
  onUpdateSuccess,
  onUpdateError,
  disabled = false,
  allowUnassign = false
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    getOptimisticValue, 
    setOptimisticValue, 
    clearOptimisticValue, 
    hasOptimisticValue 
  } = useOptimisticUpdates();

  const { updateField, isUpdating, error } = useUpdateIssueField({
    onSuccess: (issueKey, fieldName, newValue) => {
      setIsOpen(false);
      setShowError(false);
      
      // Don't clear optimistic state - let it persist until natural expiry
      // This ensures the value stays consistent regardless of any data refreshes
      
      onUpdateSuccess?.(newValue);
    },
    onError: (error) => {
      setShowError(true);
      // Revert optimistic update on error
      clearOptimisticValue(issueKey, fieldName);
      onUpdateError?.(error);
    }
  });

  const handleToggleDropdown = useCallback(() => {
    if (disabled || isUpdating || loading) return;
    setIsOpen(!isOpen);
    setShowError(false);
  }, [disabled, isUpdating, loading, isOpen]);

  const handleSelectOption = useCallback(async (option: DropdownOption | null) => {
    if (isUpdating) return;

    // Set optimistic values immediately as a structured object
    const optimisticData = option ? {
      value: option.id,
      displayName: option.name,
      iconUrl: option.iconUrl || option.avatarUrl
    } : {
      value: null,
      displayName: undefined,
      iconUrl: undefined
    };
    
    setOptimisticValue(issueKey, fieldName, optimisticData);
    setIsOpen(false);

    // Add a small delay to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 200));

    const fieldValueToSend = option?.id || null;
    
    const success = await updateField(issueKey, fieldName, fieldValueToSend);
    if (!success) {
      // Error handling is done in the hook
      return;
    }
    
  }, [isUpdating, updateField, issueKey, fieldName, setOptimisticValue]);

  // Initialize optimistic values when component mounts or when props change (but not during optimistic updates)
  useEffect(() => {
    if (!hasOptimisticValue(issueKey, fieldName)) {
      // No optimistic update, so props values are the current values
    }
  }, [currentValue, currentDisplayName, currentIconUrl, issueKey, fieldName, hasOptimisticValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getDisplayContent = () => {
    if (loading) {
      return (
        <>
          <LoadingText>Loading...</LoadingText>
          <SmallLoadingSpinner />
        </>
      );
    }

    const optimisticData = getOptimisticValue(issueKey, fieldName) as { value: string | null; displayName?: string; iconUrl?: string } | undefined;
    
    // If we have optimistic data, use it (including null/undefined for unassign)
    // If no optimistic data, use current props
    const displayName = hasOptimisticValue(issueKey, fieldName) 
      ? optimisticData?.displayName 
      : currentDisplayName;
    const iconUrl = hasOptimisticValue(issueKey, fieldName) 
      ? optimisticData?.iconUrl 
      : currentIconUrl;
    
    const isEmpty = !displayName;

    if (isEmpty) {
      return <PlaceholderText>{placeholder}</PlaceholderText>;
    }

    return (
      <>
        {iconUrl && (
          fieldName === 'assignee' ? 
            <OptionAvatar src={iconUrl} alt={displayName} /> :
            <OptionIcon src={iconUrl} alt={displayName} />
        )}
        <DisplayText>{displayName}</DisplayText>
        {isUpdating && <SmallLoadingSpinner />}
      </>
    );
  };

  const optimisticData = getOptimisticValue(issueKey, fieldName) as { value: string | null; displayName?: string; iconUrl?: string } | undefined;
  const isEmpty = hasOptimisticValue(issueKey, fieldName) 
    ? !optimisticData?.displayName 
    : !currentDisplayName;

  return (
    <DropdownContainer ref={dropdownRef} $disabled={disabled}>
      <DisplayValue
        $isEmpty={isEmpty}
        $disabled={disabled}
        $isUpdating={isUpdating}
        onClick={handleToggleDropdown}
        colors={colors}
      >
        {getDisplayContent()}
      </DisplayValue>

      <DropdownList $isOpen={isOpen} colors={colors}>
        {allowUnassign && (
          <DropdownOptionItem
            $isSelected={
              hasOptimisticValue(issueKey, fieldName) 
                ? optimisticData?.value === null 
                : !currentValue
            }
            onClick={() => handleSelectOption(null)}
            colors={colors}
          >
            <OptionText colors={colors}>Unassigned</OptionText>
          </DropdownOptionItem>
        )}
        {options.map((option) => (
          <DropdownOptionItem
            key={option.id}
            $isSelected={
              hasOptimisticValue(issueKey, fieldName)
                ? optimisticData?.value === option.id
                : currentValue === option.id
            }
            onClick={() => handleSelectOption(option)}
            colors={colors}
          >
            {option.iconUrl && <OptionIcon src={option.iconUrl} alt={option.name} />}
            {option.avatarUrl && <OptionAvatar src={option.avatarUrl} alt={option.name} />}
            <OptionText colors={colors}>{option.name}</OptionText>
          </DropdownOptionItem>
        ))}
      </DropdownList>

      {showError && error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
    </DropdownContainer>
  );
};
