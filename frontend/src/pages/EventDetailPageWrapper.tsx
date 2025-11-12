import EventDetailPage from '../components/events/EventDetailPage';

export default function EventDetailPageWrapper() {
  return (
    <div style={styles.container}>
      <EventDetailPage />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: '40px',
  },
};
