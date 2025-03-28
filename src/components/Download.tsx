import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#E4E4E4',
    padding: 10,
    height: '100%'

  },
  messages: {
    backgroundColor: "#fff",
    padding: 10,
  },
  message_user: {
    backgroundColor: "#f1f0f0",
    maxWidth: "70%",
    lineHeight: 1.5,
    borderRadius: "10px",
    fontSize: "14px",
    padding: "10px",
  },
  message_adv: {
    backgroundColor: "#dcf8c6",
    maxWidth: "70%",
    textAlign: "right",
    alignSelf: "flex-end",
    lineHeight: 1.5,
    borderRadius: "10px",
    fontSize: "14px",
    padding: "10px",
  }
});

const Download = ({ chat }: any) => {

    const mapMessages = () => {
        const messages = chat.messages;
        return (
            messages.map((msg:any) => (
                <View key={msg.id} style={styles.messages}>
                    <View wrap={false} style={msg.sender_type === 1 || msg.sender_type === 2 ? styles.message_adv : styles.message_user}>
                        <Text>
                            {msg.content}
                        </Text>
                    </View>
                </View>
            ))
        )
    }

    return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text>Cliente atendido: {chat.detail.client_phone}</Text>
                    {mapMessages()}
                </Page>
            </Document>
        )
};

export default Download;
