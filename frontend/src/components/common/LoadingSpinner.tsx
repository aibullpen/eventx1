interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#4285f4' 
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60,
  };

  const spinnerSize = sizeMap[size];

  return (
    <div
      style={{
        ...styles.spinner,
        width: spinnerSize,
        height: spinnerSize,
        borderColor: `${color}33`,
        borderTopColor: color,
      }}
    />
  );
}

const styles = {
  spinner: {
    border: '3px solid',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
