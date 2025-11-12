interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  count?: number;
  gap?: string | number;
}

export default function SkeletonLoader({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  count = 1,
  gap = '12px',
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {skeletons.map((index) => (
        <div
          key={index}
          style={{
            ...styles.skeleton,
            width,
            height,
            borderRadius,
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  skeleton: {
    backgroundColor: '#e0e0e0',
    backgroundImage: 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
};

// Add shimmer animation to CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;
document.head.appendChild(styleSheet);
