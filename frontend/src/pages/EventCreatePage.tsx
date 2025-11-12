import EventCreateForm from '../components/events/EventCreateForm';

export default function EventCreatePage() {
  return (
    <div style={styles.container}>
      <EventCreateForm />
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
