const React = require('react');

const mockReactNative = {
  View: ({ children, style, testID, ...props }) => (
    React.createElement('div', { 
      'data-testid': testID, 
      style: Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style,
      ...props
    }, children)
  ),
  Text: ({ children, style, numberOfLines, testID, ...props }) => (
    React.createElement('span', { 
      'data-testid': testID,
      style: {
        ...(Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style),
        ...(numberOfLines === 1 ? { 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        } : {})
      },
      ...props
    }, children)
  ),
  TextInput: ({ style, onFocus, onBlur, onChangeText, value, placeholder, secureTextEntry, testID, ...props }) => {
    const [focused, setFocused] = React.useState(false);
    
    return React.createElement('input', {
      'data-testid': testID,
      type: secureTextEntry ? 'password' : 'text',
      value: value || '',
      placeholder,
      style: Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style,
      onFocus: (e) => {
        setFocused(true);
        onFocus && onFocus(e);
      },
      onBlur: (e) => {
        setFocused(false);
        onBlur && onBlur(e);
      },
      onChange: (e) => {
        onChangeText && onChangeText(e.target.value);
      },
      ...props
    });
  },
  TouchableOpacity: ({ children, onPress, disabled, activeOpacity, style, testID, ...props }) => (
    React.createElement('button', {
      'data-testid': testID,
      onClick: disabled ? undefined : onPress,
      disabled,
      style: {
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...(Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style)
      },
      ...props
    }, children)
  ),
  ActivityIndicator: ({ size, color, testID, ...props }) => (
    React.createElement('div', {
      'data-testid': testID || 'activity-indicator',
      role: 'status',
      'aria-label': 'Loading',
      style: {
        width: size === 'small' ? '20px' : '40px',
        height: size === 'small' ? '20px' : '40px',
        borderRadius: '50%',
        border: `2px solid ${color || '#ccc'}`,
        borderTopColor: 'transparent',
        animation: 'spin 1s linear infinite'
      },
      ...props
    })
  ),
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => (Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style)
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667 })
  }
};

module.exports = mockReactNative;