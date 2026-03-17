import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  // Define language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Globe className="h-4 w-4" />
          <span>{languageOptions.find(option => option.value === i18n.language)?.label || 'Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={undefined}>
        {languageOptions.map((option) => (
          <DropdownMenuItem
                key={option.value}
                onClick={() => i18n.changeLanguage(option.value as 'en' | 'fr' | 'ar')}
                className="flex items-center justify-between" inset={undefined}          >
            <span>{option.label}</span>
            {i18n.language === option.value && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
