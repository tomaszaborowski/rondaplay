import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  let baseStyle = 'px-6 py-3 rounded-full font-bold transition-all duration-100 uppercase tracking-wider text-sm select-none active:translate-y-[6px]';
  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle = 'btn-game-primary';
      break;
    case 'secondary':
      variantStyle = 'btn-game-secondary';
      break;
    case 'outline':
      baseStyle = 'px-6 py-3 rounded-full font-bold border-2 border-white/50 text-white hover:bg-white/10 transition-all select-none active:translate-y-[2px]';
      variantStyle = '';
      break;
    case 'ghost':
      baseStyle = 'px-6 py-3 rounded-full font-bold text-white hover:bg-white/10 transition-all select-none active:translate-y-[1px]';
      variantStyle = '';
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
