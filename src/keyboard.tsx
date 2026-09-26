import { useLanguage } from './language';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  ScrollView,
  TextInput,
  type TextInputProps,
} from 'react-native';

export const KeyboardFocusContext = createContext<(input: TextInput) => void>(
  () => {},
);

export function useKeyboardForm(scroll: React.RefObject<ScrollView | null>) {
  const focused = useRef<TextInput | null>(null);
  const frame = useRef<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const revealFocusedInput = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (focused.current?.isFocused()) {
        scroll.current?.scrollResponderScrollNativeHandleToKeyboard(
          focused.current,
          24,
          true,
        );
      }
    });
  }, [scroll]);
  const focusInput = useCallback(
    (input: TextInput) => {
      focused.current = input;
      revealFocusedInput();
    },
    [revealFocusedInput],
  );
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      revealFocusedInput();
    });
    const change = Keyboard.addListener(
      'keyboardDidChangeFrame',
      revealFocusedInput,
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      change.remove();
      hide.remove();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [revealFocusedInput]);
  return { focusInput, revealFocusedInput, keyboardVisible };
}

export function KeyboardTextInput({
  onFocus,
  onContentSizeChange,
  style,
  ...props
}: TextInputProps) {
  const { isRTL } = useLanguage();
  const input = useRef<TextInput>(null);
  const focusInput = useContext(KeyboardFocusContext);
  return (
    <TextInput
      {...props}
      ref={input}
      style={[{ textAlign: isRTL ? 'right' : 'left' }, style]}
      onFocus={(event) => {
        if (input.current) focusInput(input.current);
        onFocus?.(event);
      }}
      onContentSizeChange={(event) => {
        if (input.current?.isFocused()) focusInput(input.current);
        onContentSizeChange?.(event);
      }}
    />
  );
}
