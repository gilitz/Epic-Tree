import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useUpdateIssueField } from '../hooks/use-update-issue-field';
import { useOptimisticUpdates } from '../contexts/optimistic-updates-context';
import { useTheme, CSSThemeColors } from '../theme/theme-context';
import { MediumLoadingSpinner } from './loading-spinner';

interface EditableFieldProps {
  issueKey: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'textarea';
  value: string | number | undefined | null;
  placeholder?: string;
  displayValue?: string; // For cases where display differs from actual value
  onUpdateSuccess?: (newValue: unknown) => void;
  onUpdateError?: (error: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
}

const EditableContainer = styled.div<{ $disabled?: boolean; $isUpdating?: boolean }>`
  position: relative;
  display: inline-block;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
  width: 100%;
  max-width: fit-content;
  min-width: 0;
`;

const DisplayValue = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && !prop.startsWith('$'),
})<{ $isEditing?: boolean; $isEmpty?: boolean; $disabled?: boolean; $isUpdating?: boolean; colors?: CSSThemeColors }>`
  display: ${props => props.$isEditing ? 'none' : 'inline-flex'};
  align-items: center;
  color: ${props => props.$isEmpty ? '#9ca3af' : 'inherit'};
  font-style: ${props => props.$isEmpty ? 'italic' : 'normal'};
  padding: clamp(1px, 0.5vw, 2px) clamp(2px, 1vw, 4px);
  border-radius: 3px;
  border: 1px solid transparent;
  min-width: clamp(16px, 4vw, 20px);
  min-height: clamp(14px, 3vw, 16px);
  position: relative;
  opacity: ${props => props.$isUpdating ? 0.7 : 1};
  transition: opacity 0.2s ease;
  font-size: clamp(11px, 2.5vw, 13px);
  line-height: 1.2;
  word-break: break-word;
  max-width: 100%;
  
  &:hover {
    background-color: ${props => props.$disabled ? 'transparent' : (props.colors?.surface.hover || '#f3f4f6')};
    border-color: ${props => props.$disabled ? 'transparent' : (props.colors?.border.primary || '#d1d5db')};
  }
  
  &:after {
    content: ${props => props.$disabled ? 'none' : '"✏️"'};
    position: absolute;
    right: clamp(-12px, -3vw, -16px);
    top: 50%;
    transform: translateY(-50%);
    font-size: clamp(8px, 2vw, 10px);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover:after {
    opacity: ${props => props.$disabled ? 0 : 0.6};
  }
`;

const EditInputContainer = styled.div<{ $isEditing?: boolean }>`
  display: ${props => props.$isEditing ? 'inline-flex' : 'none'};
  align-items: center;
  gap: clamp(2px, 1vw, 4px);
  width: 100%;
  max-width: fit-content;
`;

const EditInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && prop !== '$isEditing',
})<{ $isEditing?: boolean; colors?: CSSThemeColors }>`
  background: ${props => props.colors?.surface.primary || 'white'};
  border: 2px solid ${props => props.colors?.border.focus || '#3b82f6'};
  border-radius: 3px;
  padding: clamp(1px, 0.5vw, 2px) clamp(2px, 1vw, 4px);
  font-size: clamp(11px, 2.5vw, 13px);
  font-family: inherit;
  color: ${props => props.colors?.text.primary || 'inherit'};
  outline: none;
  min-width: clamp(50px, 12vw, 60px);
  max-width: 100%;
  flex: 1;
  
  &:focus {
    border-color: ${props => props.colors?.interactive.primaryHover || '#1d4ed8'};
    box-shadow: 0 0 0 1px ${props => props.colors?.interactive.primaryHover || '#1d4ed8'};
  }
`;

const EditTextareaContainer = styled.div<{ $isEditing?: boolean }>`
  display: ${props => props.$isEditing ? 'flex' : 'none'};
  flex-direction: column;
  gap: clamp(2px, 1vw, 4px);
  width: 100%;
  max-width: fit-content;
`;

const EditTextarea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && prop !== '$isEditing',
})<{ $isEditing?: boolean; colors?: CSSThemeColors }>`
  background: ${props => props.colors?.surface.primary || 'white'};
  border: 2px solid ${props => props.colors?.border.focus || '#3b82f6'};
  border-radius: 3px;
  padding: clamp(2px, 1vw, 4px);
  font-size: clamp(11px, 2.5vw, 13px);
  font-family: inherit;
  color: ${props => props.colors?.text.primary || 'inherit'};
  outline: none;
  min-width: clamp(150px, 40vw, 200px);
  min-height: clamp(50px, 12vh, 60px);
  max-width: 100%;
  resize: vertical;
  
  &:focus {
    border-color: ${props => props.colors?.interactive.primaryHover || '#1d4ed8'};
    box-shadow: 0 0 0 1px ${props => props.colors?.interactive.primaryHover || '#1d4ed8'};
  }
`;

const EditButtonsContainer = styled.div`
  display: flex;
  gap: clamp(2px, 1vw, 4px);
  align-items: center;
  flex-shrink: 0;
`;

const AcceptButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 3px;
  width: clamp(16px, 4vw, 20px);
  height: clamp(16px, 4vw, 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: bold;
  flex-shrink: 0;
  
  &:hover {
    background: #059669;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 3px;
  width: clamp(16px, 4vw, 20px);
  height: clamp(16px, 4vw, 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: bold;
  flex-shrink: 0;
  
  &:hover {
    background: #dc2626;
  }
`;

const LoadingDots = styled.span`
  display: inline-block;
  margin-left: 6px;
  color: #3b82f6;
  font-weight: bold;
  flex-shrink: 0;
  min-width: 20px;
  
  &::after {
    content: '';
    animation: dots 1s infinite;
  }
  
  @keyframes dots {
    0%, 25% {
      content: '.';
    }
    26%, 50% {
      content: '..';
    }
    51%, 75% {
      content: '...';
    }
    76%, 100% {
      content: '';
    }
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  margin-top: 2px;
`;

export const EditableField: React.FC<EditableFieldProps> = ({
  issueKey,
  fieldName,
  fieldType,
  value,
  placeholder = 'Click to edit',
  displayValue,
  onUpdateSuccess,
  onUpdateError,
  disabled = false,
  multiline = false,
  maxLength,
  min,
  max,
  step = 1
}) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    getOptimisticValue, 
    setOptimisticValue, 
    clearOptimisticValue, 
    hasOptimisticValue 
  } = useOptimisticUpdates();

  const { updateField, isUpdating, error } = useUpdateIssueField({
    onSuccess: (issueKey, fieldName, newValue) => {
      setIsEditing(false);
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

  const handleStartEdit = () => {
    if (disabled || isUpdating) return;
    
    setIsEditing(true);
    setShowError(false);
    setEditValue(value?.toString() || '');
  };

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setShowError(false);
    setEditValue('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (isUpdating) return;

    let processedValue: unknown = editValue;

    // Process value based on field type
    if (fieldType === 'number') {
      if (editValue.trim() === '') {
        processedValue = null;
      } else {
        const numValue = parseFloat(editValue);
        if (isNaN(numValue)) {
          setShowError(true);
          return;
        }
        processedValue = numValue;
      }
    } else if (fieldType === 'text' || fieldType === 'textarea') {
      processedValue = editValue.trim() || null;
    }

    // Exit edit mode immediately to show the loading state
    setIsEditing(false);
    
    // Set optimistic value immediately
    setOptimisticValue(issueKey, fieldName, processedValue);

    // Add a small delay to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 200));

    const success = await updateField(issueKey, fieldName, processedValue);
    if (!success) {
      // Error handling is done in the hook
      return;
    }
  }, [editValue, fieldType, isUpdating, updateField, issueKey, fieldName, setOptimisticValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    // Remove auto-submit on Enter for single-line inputs - user must click accept button
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  // Sync optimistic value with actual value when not updating and not in optimistic state
  useEffect(() => {
    if (!hasOptimisticValue(issueKey, fieldName)) {
      // No optimistic update, so props value is the current value
    }
  }, [value, issueKey, fieldName, hasOptimisticValue]);

  // Handle click outside to cancel (changed from save to avoid accidental saves)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isEditing && 
          !inputRef.current?.contains(target) &&
          !textareaRef.current?.contains(target) &&
          !(target as Element).closest('button')) {
        handleCancelEdit();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, editValue, handleCancelEdit]);

  const getDisplayText = () => {
    if (displayValue !== undefined) {
      return displayValue;
    }
    
    // Show optimistic value immediately when updating
    const optimisticVal = getOptimisticValue(issueKey, fieldName);
    const currentValue = optimisticVal !== undefined ? optimisticVal : value;
    
    if (currentValue === null || currentValue === undefined || currentValue === '') {
      return placeholder;
    }
    
    return currentValue.toString();
  };

  const optimisticVal = getOptimisticValue(issueKey, fieldName);
  const currentValue = optimisticVal !== undefined ? optimisticVal : value;
  const isEmpty = currentValue === null || currentValue === undefined || currentValue === '';

  return (
    <EditableContainer $disabled={disabled} $isUpdating={isUpdating}>
      <DisplayValue
        $isEditing={isEditing}
        $isEmpty={isEmpty}
        $disabled={disabled}
        $isUpdating={isUpdating}
        onClick={handleStartEdit}
        colors={colors}
      >
        {getDisplayText()}
        {isUpdating && (
          fieldType === 'number' ? <MediumLoadingSpinner margin="0 0 0 8px" /> : <LoadingDots />
        )}
      </DisplayValue>

      {multiline ? (
        <EditTextareaContainer $isEditing={isEditing}>
          <EditTextarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            colors={colors}
          />
          <EditButtonsContainer>
            <AcceptButton
              onClick={handleSaveEdit}
              disabled={isUpdating}
            >
              ✓
            </AcceptButton>
            <CancelButton
              onClick={handleCancelEdit}
            >
              ✕
            </CancelButton>
          </EditButtonsContainer>
        </EditTextareaContainer>
      ) : (
        <EditInputContainer $isEditing={isEditing}>
          <EditInput
            ref={inputRef}
            type={fieldType}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            colors={colors}
          />
          <AcceptButton
            onClick={handleSaveEdit}
            disabled={isUpdating}
          >
            ✓
          </AcceptButton>
          <CancelButton
            onClick={handleCancelEdit}
          >
            ✕
          </CancelButton>
        </EditInputContainer>
      )}

      {showError && error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
    </EditableContainer>
  );
}; 