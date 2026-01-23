import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { contentfulService } from '../services/contentful';

interface TermsScreenProps {
  onClose: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        // Hardcoded Entry ID as requested
        const entry = await contentfulService.getEntry('N7HdmJVPIvzOmSfrdk4Sn');
        setContent(entry);
      } catch (err) {
        setError('Failed to load Terms of Service. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  // Simple recursive renderer for Contentful Rich Text
  const renderNode = (node: any, index: number) => {
    if (node.nodeType === 'text') {
      return <Text key={index} style={styles.bodyText}>{node.value}</Text>;
    }

    if (node.content && Array.isArray(node.content)) {
      const children = node.content.map((child: any, i: number) => renderNode(child, i));

      switch (node.nodeType) {
        case 'document':
           return <View key={index}>{children}</View>;
        case 'paragraph':
          return (
            <View key={index} style={styles.paragraph}>
              <Text style={styles.bodyText}>{children}</Text>
            </View>
          );
        case 'heading-1':
          return (
            <Text key={index} style={styles.heading1}>{children}</Text>
          );
        case 'heading-2':
          return (
            <Text key={index} style={styles.heading2}>{children}</Text>
          );
        case 'heading-3':
        case 'heading-4':
        case 'heading-5':
        case 'heading-6':
          return (
            <Text key={index} style={styles.heading3}>{children}</Text>
          );
        case 'hyperlink':
           return (
             <Text key={index} style={styles.link} onPress={() => console.log('Link pressed:', node.data.uri)}>
               {children}
             </Text>
           );
        default:
           return <View key={index}>{children}</View>;
      }
    }
    
    return null;
  };

  const renderContent = () => {
    if (!content) return null;
    const { fields } = content;
    
    // 1. Render Title/Heading if present
    // Common keys for titles in Contentful
    const title = fields.title || fields.heading || fields.name;
    
    return (
        <View>
            {/* 2. Render Rich Text Fields */}
            {Object.keys(fields).map((key) => {
                const field = fields[key];
                
                // Skip title fields or metadata
                if (['title', 'heading', 'name', 'slug', 'id', 'uid'].includes(key)) return null;

                // Handle Rich Text
                if (field && field.nodeType && field.content) {
                    return (
                        <View key={key} style={styles.section}>
                            {renderNode(field, 0)}
                        </View>
                    );
                }
                
                // Handle long text strings (fallback)
                if (typeof field === 'string' && field.length > 20) {
                     return (
                        <View key={key} style={styles.paragraph}>
                             <Text style={styles.bodyText}>{field}</Text>
                        </View>
                     );
                }
                
                return null;
            })}
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Terms & Privacy</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0b2e26" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={onClose} style={styles.retryButton}>
                <Text style={styles.retryText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderContent()}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF', // iOS blue or brand color
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
      padding: 12,
      backgroundColor: '#eee',
      borderRadius: 8
  },
  retryText: {
      color: '#000'
  },
  disclaimer: {
      marginTop: 20,
      color: 'gray',
      fontStyle: 'italic',
      fontSize: 12
  },
  paragraph: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 6,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  }
});
