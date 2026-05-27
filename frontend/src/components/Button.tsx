import React, { type ButtonHTMLAttributes } from 'react';
import './Button.css';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  size?: 'normal' | 'large';
  colour?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  size = 'normal',
  colour = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...rest
}) => {
  // Construct dynamic class names based on props
  const buttonClasses = [
    'button',
    `button-${size}`,
    `button-${colour}`,
    className
  ].join(' ').trim();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button"
      className={buttonClasses}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      {text}
    </button>
  );
};

export default Button;