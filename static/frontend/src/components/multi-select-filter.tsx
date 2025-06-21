import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../theme/theme-context';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  avatarUrl?: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  showAvatars?: boolean;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  showAvatars = false,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionValue: string) => {
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(value => value !== optionValue)
      : [...selectedValues, optionValue];
    
    onChange(newSelectedValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getDisplayInfo = () => {
    if (selectedValues.length === 0) {
      return { text: null, count: 0, firstOption: null };
    }
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return { text: option?.label || selectedValues[0], count: 0, firstOption: option };
    }
    const firstOption = options.find(opt => opt.value === selectedValues[0]);
    return { 
      text: firstOption?.label || selectedValues[0], 
      count: selectedValues.length - 1, 
      firstOption 
    };
  };

  const displayInfo = getDisplayInfo();
  
  const getTooltipOptions = () => {
    if (selectedValues.length <= 1) return [];
    const remainingOptions = selectedValues.slice(1).map(value => {
      const option = options.find(opt => opt.value === value);
      return option || { id: value, label: value, value };
    });
    return remainingOptions;
  };

  const hasSelections = selectedValues.length > 0;

  return (
    <FilterContainer ref={dropdownRef} colors={colors}>
      <FilterButton
        onClick={() => setIsOpen(!isOpen)}
        colors={colors}
        isActive={hasSelections}
        isOpen={isOpen}
      >
        <FilterLabel colors={colors}>
          {label}{displayInfo.text ? ':' : ''}
        </FilterLabel>
        <FilterContentWrapper>
          {displayInfo.text && (
            <FilterContent>
              <FilterTag colors={colors}>
                {showAvatars && displayInfo.firstOption?.avatarUrl && (
                  <Avatar src={displayInfo.firstOption.avatarUrl} alt={displayInfo.firstOption.label} />
                )}
                <FilterValue colors={colors}>
                  {displayInfo.text}
                </FilterValue>
              </FilterTag>
              {displayInfo.count > 0 && (
                <TooltipContainer>
                  <CountBadge 
                    colors={colors}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    +{displayInfo.count}
                  </CountBadge>
                  {showTooltip && (
                    <Tooltip colors={colors}>
                      {getTooltipOptions().map((option, index) => (
                        <TooltipLine key={index}>
                          <TooltipContent>
                            {showAvatars && option.avatarUrl && (
                              <TooltipAvatar src={option.avatarUrl} alt={option.label} />
                            )}
                            <TooltipText>• {option.label}</TooltipText>
                          </TooltipContent>
                        </TooltipLine>
                      ))}
                    </Tooltip>
                  )}
                </TooltipContainer>
              )}
            </FilterContent>
          )}
        </FilterContentWrapper>
        <DropdownArrow colors={colors} isOpen={isOpen}>
          ▼
        </DropdownArrow>
      </FilterButton>

      {isOpen && (
        <DropdownMenu colors={colors}>
          <DropdownHeader colors={colors}>
            <HeaderTitle colors={colors}>{label}</HeaderTitle>
            {hasSelections && (
              <ClearButton onClick={handleClearAll} colors={colors}>
                Clear All
              </ClearButton>
            )}
          </DropdownHeader>
          
          <OptionsList>
            {options.map((option) => (
              <OptionItem
                key={option.id}
                onClick={() => handleToggleOption(option.value)}
                colors={colors}
                isSelected={selectedValues.includes(option.value)}
              >
                <Checkbox
                  colors={colors}
                  isSelected={selectedValues.includes(option.value)}
                >
                  {selectedValues.includes(option.value) && '✓'}
                </Checkbox>
                
                {showAvatars && option.avatarUrl && (
                  <DropdownAvatar src={option.avatarUrl} alt={option.label} />
                )}
                
                <OptionLabel colors={colors}>{option.label}</OptionLabel>
              </OptionItem>
            ))}
          </OptionsList>
        </DropdownMenu>
      )}
    </FilterContainer>
  );
};

// Styled Components
const FilterContainer = styled.div<{ colors: any }>`
  position: relative;
  display: inline-block;
`;

const FilterButton = styled.button<{ colors: any; isActive: boolean; isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  background: ${props => props.isActive ? props.colors.surface.hover : props.colors.background.primary};
  border: 1px solid ${props => props.isActive ? props.colors.interactive.primary : props.colors.border.primary};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  height: 28px;
  
  &:hover {
    background: ${props => props.colors.background.secondary};
    border-color: ${props => props.colors.interactive.primary};
  }

  ${props => props.isOpen && `
    border-color: ${props.colors.interactive.primary};
    box-shadow: 0 0 0 2px ${props.colors.surface.hover};
  `}
`;

const FilterLabel = styled.span<{ colors: any }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.colors.text.tertiary};
  white-space: nowrap;
  flex-shrink: 0;
`;

const FilterContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

const FilterContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  height: 100%;
`;

const FilterTag = styled.div<{ colors: any }>`
  display: flex;
  align-items: center;
  gap: 3px;
  background: ${props => props.colors.surface.secondary};
  border: 1px solid ${props => props.colors.border.secondary};
  border-radius: 8px;
  padding: 2px 6px;
  max-width: 120px;
  min-height: 18px;
  flex-shrink: 1;
`;

const FilterValue = styled.span<{ colors: any }>`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const CountBadge = styled.span<{ colors: any }>`
  background: ${props => props.colors.surface.secondary};
  border: 1px solid ${props => props.colors.border.secondary};
  color: ${props => props.colors.text.primary};
  font-size: 10px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  cursor: default;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${props => props.colors.surface.hover};
  }
`;

const Tooltip = styled.div<{ colors: any }>`
  position: absolute;
  top: 100%;
  left: 0;
  background: ${props => props.colors.background.elevated};
  border: 1px solid ${props => props.colors.border.primary};
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 11px;
  color: ${props => props.colors.text.primary};
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  margin-top: 4px;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 8px;
    border: 4px solid transparent;
    border-bottom-color: ${props => props.colors.background.elevated};
  }
`;

const TooltipLine = styled.div`
  line-height: 1.3;
  
  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;

const TooltipContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TooltipAvatar = styled.img`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const TooltipText = styled.span`
  flex: 1;
`;

const DropdownArrow = styled.span<{ colors: any; isOpen: boolean }>`
  font-size: 8px;
  color: ${props => props.colors.text.secondary};
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
  margin-left: auto;
`;

const DropdownMenu = styled.div<{ colors: any }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: ${props => props.colors.background.primary};
  border: 1px solid ${props => props.colors.border.primary};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  min-width: 180px;
  max-width: 250px;
`;

const DropdownHeader = styled.div<{ colors: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid ${props => props.colors.border.primary};
`;

const HeaderTitle = styled.span<{ colors: any }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.colors.text.primary};
`;

const ClearButton = styled.button<{ colors: any }>`
  background: none;
  border: none;
  color: ${props => props.colors.interactive.primary};
  font-size: 10px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.colors.surface.hover};
  }
`;

const OptionsList = styled.div`
  max-height: 180px;
  overflow-y: auto;
`;

const OptionItem = styled.div<{ colors: any; isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.colors.background.secondary};
  }
  
  ${props => props.isSelected && `
    background: ${props.colors.surface.hover};
  `}
`;

const Checkbox = styled.div<{ colors: any; isSelected: boolean }>`
  width: 14px;
  height: 14px;
  border: 2px solid ${props => props.isSelected ? props.colors.interactive.primary : props.colors.border.primary};
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isSelected ? props.colors.interactive.primary : 'transparent'};
  color: white;
  font-size: 9px;
  font-weight: bold;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const DropdownAvatar = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const OptionLabel = styled.span<{ colors: any }>`
  font-size: 12px;
  color: ${props => props.colors.text.primary};
  flex: 1;
`; 