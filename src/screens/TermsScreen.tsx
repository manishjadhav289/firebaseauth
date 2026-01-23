import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contentfulService } from '../services/contentful';

// --- HELPER FUNCTIONS (Moved outside component) ---

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
        return <Text key={index} style={styles.heading1}>{children}</Text>;
      case 'heading-2':
        return <Text key={index} style={styles.heading2}>{children}</Text>;
      case 'heading-3':
      case 'heading-4':
      case 'heading-5':
      case 'heading-6':
        return <Text key={index} style={styles.heading3}>{children}</Text>;
      case 'hyperlink':
         return (
           <Text key={index} style={styles.link} onPress={() => {
              if (node.data?.uri) Linking.openURL(node.data.uri).catch(err => console.error(err));
           }}>
             {children}
           </Text>
         );
      default:
         return <View key={index}>{children}</View>;
    }
  }
  
  return null;
};

// --- COMPONENT ---

// --- CONSTANTS ---
const TERMS_ENTRY_ID = 'N7HdmJVPIvzOmSfrdk4Sn';
const PRIVACY_ENTRY_ID = '1Gcqs96s9QXRj0HyjmcXrp';

interface TermsScreenProps {
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const TermsScreen: React.FC<TermsScreenProps> = (props) => {
  const { onClose, initialTab } = props;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab || 'terms');

  useEffect(() => {
    let isMounted = true;
    
    // Reset state when tab changes
    setLoading(true);
    setContent(null);
    setError(null);

    const fetchContent = async () => {
      try {
        const entryId = activeTab === 'terms' ? TERMS_ENTRY_ID : PRIVACY_ENTRY_ID;
        const entry = await contentfulService.getEntry(entryId);
        
        if (isMounted) {
          setContent(entry);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to load ${activeTab === 'terms' ? 'Terms' : 'Privacy Policy'}.`);
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [activeTab]); // Re-run when activeTab changes

  const renderContent = () => {
    if (!content) return null;
    const { fields } = content;
    
    return (
        <View>
             {/* Render Rich Text Fields */}
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                    <Text style={styles.iconText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                    <Text style={styles.iconText}>←</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.headerRight}>
                <Text style={styles.logoText}>X</Text>
            </View>
        </View>

        {/* PAGE TITLE */}
        <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>Legal</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabContainer}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
                onPress={() => setActiveTab('terms')}
            >
                <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>Terms of Use</Text>
                {activeTab === 'terms' && <View style={styles.activeTabLine} />}
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
                onPress={() => setActiveTab('privacy')}
            >
                <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>Privacy Policy</Text>
                 {activeTab === 'privacy' && <View style={styles.activeTabLine} />}
            </TouchableOpacity>
        </View>


        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0b2e26" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setActiveTab(activeTab)} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
               {/* Dynamic Title */}
              <Text style={styles.staticContentTitle}>
                  {activeTab === 'terms' ? 'General Terms & Conditions of Service' : 'Privacy Policy'}
              </Text>
              {renderContent()}
          </ScrollView>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton} onPress={onClose}>
                <Text style={styles.footerButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
      </View>

  );
};

// --- STYLES ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
      flexDirection: 'row',
      gap: 16,
  },
  headerRight: {},
  iconButton: {
      padding: 4,
  },
  iconText: {
      fontSize: 24,
      color: '#000',
      fontFamily: 'Gilroy-Light',
  },
  logoText: {
      fontSize: 28,
      fontWeight: '900',
      color: '#00e600', 
      fontStyle: 'italic',
      fontFamily: 'Gilroy-Bold',
  },
  pageTitleContainer: {
      paddingHorizontal: 20,
      marginBottom: 16,
  },
  pageTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#000',
      fontFamily: 'Gilroy-Bold',
  },
  tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      marginBottom: 0,
  },
  tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      position: 'relative',
      backgroundColor: '#f5f5f5', 
      marginRight: 8,
      borderRadius: 4,
  },
  activeTab: {
      backgroundColor: '#eff0f1',
  },
  tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#888',
      fontFamily: 'Gilroy-Medium',
  },
  activeTabText: {
      color: '#000',
  },
  activeTabLine: {
      position: 'absolute',
      top: 0,
      width: '100%',
      height: 3,
      backgroundColor: '#000',
      borderBottomLeftRadius: 2,
      borderBottomRightRadius: 2,
  },
  
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  staticContentTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#0f2421',
      marginBottom: 16,
      lineHeight: 32,
      fontFamily: 'Gilroy-Bold',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Gilroy-Bold',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'Gilroy-Bold',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 6,
    fontFamily: 'Gilroy-Bold',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    fontFamily: 'Gilroy-Regular',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
  },
  retryButton: {
      padding: 12,
      backgroundColor: '#eee',
      borderRadius: 8
  },
  retryText: {
      color: '#000',
      fontFamily: 'Gilroy-Medium',
  },
  paragraph: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontFamily: 'Gilroy-Medium',
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#eee',
  },
  footerButton: {
      borderWidth: 1,
      borderColor: '#333',
      borderRadius: 4,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 8,
  },
  footerButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      fontFamily: 'Gilroy-Bold',
  }
});
