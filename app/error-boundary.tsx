import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('🚨 ErrorBoundary - Detailed Error Report');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Name:', error.name);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Boundary State:', this.state);
    console.groupEnd();
    
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    } else {
      // Reset error state
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        errorId: ''
      });
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚠️ アプリエラー</Text>
            <Text style={styles.subtitle}>
              アプリケーションでエラーが発生しました
            </Text>
            
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>エラー詳細:</Text>
              <Text style={styles.errorMessage}>{this.state.error.message}</Text>
              
              {isDevelopment && (
                <>
                  <Text style={styles.errorTitle}>エラータイプ:</Text>
                  <Text style={styles.errorDetail}>{this.state.error.name}</Text>
                  
                  {this.state.error.stack && (
                    <>
                      <Text style={styles.errorTitle}>スタックトレース:</Text>
                      <Text style={styles.errorStack}>{this.state.error.stack}</Text>
                    </>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <Text style={styles.errorTitle}>コンポーネントスタック:</Text>
                      <Text style={styles.errorStack}>{this.state.errorInfo.componentStack}</Text>
                    </>
                  )}
                </>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                <Text style={styles.buttonText}>再試行</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.button, styles.reloadButton]} onPress={this.handleReload}>
                <Text style={styles.buttonText}>ページを再読み込み</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.helpText}>
              問題が解決しない場合は、ブラウザの開発者ツール（F12）を開いてコンソールを確認してください。
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e74c3c',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    maxWidth: 600,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 8,
    fontWeight: '600',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 100,
  },
  reloadButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
});

export default ErrorBoundary;