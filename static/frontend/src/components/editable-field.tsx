import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useUpdateIssueField } from '../hooks/use-update-issue-field';

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
`;

const DisplayValue = styled.span<{ $isEditing?: boolean; $isEmpty?: boolean; $disabled?: boolean; $isUpdating?: boolean }>`
  display: ${props => props.$isEditing ? 'none' : 'inline-flex'};
  align-items: center;
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
    background-color: ${props => props.$disabled ? 'transparent' : '#f3f4f6'};
    border-color: ${props => props.$disabled ? 'transparent' : '#d1d5db'};
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

const EditInputContainer = styled.div<{ $isEditing?: boolean }>`
  display: ${props => props.$isEditing ? 'inline-flex' : 'none'};
  align-items: center;
  gap: 4px;
`;

const EditInput = styled.input<{ $isEditing?: boolean }>`
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  outline: none;
  min-width: 60px;
  
  &:focus {
    border-color: #1d4ed8;
    box-shadow: 0 0 0 1px #1d4ed8;
  }
`;

const EditTextareaContainer = styled.div<{ $isEditing?: boolean }>`
  display: ${props => props.$isEditing ? 'flex' : 'none'};
  flex-direction: column;
  gap: 4px;
`;

const EditTextarea = styled.textarea<{ $isEditing?: boolean }>`
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 3px;
  padding: 4px;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  outline: none;
  min-width: 200px;
  min-height: 60px;
  resize: vertical;
  
  &:focus {
    border-color: #1d4ed8;
    box-shadow: 0 0 0 1px #1d4ed8;
  }
`;

const EditButtonsContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const AcceptButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  
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
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  
  &:hover {
    background: #dc2626;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-left: 8px;
  flex-shrink: 0;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState<string | number | undefined | null>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { updateField, isUpdating, error } = useUpdateIssueField({
    onSuccess: (issueKey, fieldName, newValue) => {
      setIsEditing(false);
      setShowError(false);
      // Keep the optimistic value as it should match the server response
      onUpdateSuccess?.(newValue);
    },
    onError: (error) => {
      setShowError(true);
      // Revert optimistic update on error
      setOptimisticValue(value);
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
    setOptimisticValue(processedValue as string | number | null);

    // Add a small delay to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 200));

    const success = await updateField(issueKey, fieldName, processedValue);
    if (!success) {
      // Error handling is done in the hook
      return;
    }
  }, [editValue, fieldType, isUpdating, updateField, issueKey, fieldName]);

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

  // Sync optimistic value with actual value when not updating
  useEffect(() => {
    if (!isUpdating) {
      setOptimisticValue(value);
    }
  }, [value, isUpdating]);

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
    const currentValue = optimisticValue !== undefined ? optimisticValue : value;
    
    if (currentValue === null || currentValue === undefined || currentValue === '') {
      return placeholder;
    }
    
    return currentValue.toString();
  };

  const currentValue = optimisticValue !== undefined ? optimisticValue : value;
  const isEmpty = currentValue === null || currentValue === undefined || currentValue === '';

  return (
    <EditableContainer $disabled={disabled} $isUpdating={isUpdating}>
      <DisplayValue
        $isEditing={isEditing}
        $isEmpty={isEmpty}
        $disabled={disabled}
        $isUpdating={isUpdating}
        onClick={handleStartEdit}
        title={disabled ? 'Editing disabled' : (isUpdating ? 'Updating...' : 'Click to edit')}
      >
        {getDisplayText()}
        {isUpdating && (
          fieldType === 'number' ? <LoadingSpinner /> : <LoadingDots />
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
          />
          <EditButtonsContainer>
            <AcceptButton
              onClick={handleSaveEdit}
              disabled={isUpdating}
              title="Save changes (Ctrl+Enter)"
            >
              ✓
            </AcceptButton>
            <CancelButton
              onClick={handleCancelEdit}
              title="Cancel changes (Escape)"
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
          />
          <AcceptButton
            onClick={handleSaveEdit}
            disabled={isUpdating}
            title="Save changes"
          >
            ✓
          </AcceptButton>
          <CancelButton
            onClick={handleCancelEdit}
            title="Cancel changes (Escape)"
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