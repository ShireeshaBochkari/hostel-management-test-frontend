import React from 'react';

const Badge = ({ variant = 'gray', text, icon: Icon }) => {
  const getVariantClass = (v) => {
    switch (v?.toLowerCase()) {
      case 'available':
      case 'resolved':
      case 'approved':
      case 'paid':
      case 'success':
        return 'badge-green';
      case 'open':
      case 'in_progress':
      case 'pending':
      case 'warning':
        return 'badge-amber';
      case 'full':
      case 'rejected':
      case 'danger':
      case 'error':
        return 'badge-red';
      case 'warden':
      case 'admin':
      case 'info':
        return 'badge-blue';
      case 'hosteler':
      case 'student':
        return 'badge-purple';
      default:
        return 'badge-gray';
    }
  };

  return (
    <span className={`badge ${getVariantClass(variant)}`}>
      {Icon && <Icon size={12} />}
      {text || variant}
    </span>
  );
};

export default Badge;
