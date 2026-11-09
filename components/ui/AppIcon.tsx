 'use client';

import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type IconVariant = 'outline' | 'solid';

type HeroIconComponent = React.ComponentType<
    React.ComponentProps<typeof QuestionMarkCircleIcon>
>;

interface IconProps {
    name: string;
    variant?: IconVariant;
    size?: number;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

function Icon({
    name,
    variant = 'outline',
    size = 24,
    className = '',
    onClick,
    disabled = false,
}: IconProps) {
    const iconSet = variant === 'solid' ? HeroIconsSolid : HeroIcons;

    const IconComponent = iconSet[
        name as keyof typeof iconSet
    ] as HeroIconComponent | undefined;

    const iconClassName = `${
        disabled
            ? 'opacity-50 cursor-not-allowed'
            : onClick
                ? 'cursor-pointer hover:opacity-80'
                : ''
    } ${className}`;

    const handleClick = disabled ? undefined : onClick;

    if (!IconComponent) {
        return (
            <QuestionMarkCircleIcon
                width={size}
                height={size}
                className={`text-gray-400 ${iconClassName}`}
                onClick={handleClick}
            />
        );
    }

    return (
        <IconComponent
            width={size}
            height={size}
            className={iconClassName}
            onClick={handleClick}
        />
    );
}

export default Icon;