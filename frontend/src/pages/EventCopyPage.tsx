import EventCopyForm from '../components/events/EventCopyForm';

export default function EventCopyPage() {
  return (
    <div style={styles.container}>
      <EventCopyForm />
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
