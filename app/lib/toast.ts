import { toast } from 'sonner';

interface ToastMessage {
  title?: string;
  description: string;
}

type ToastInput = string | ToastMessage;

const formatMessage = (input: ToastInput): ToastMessage => {
  if (typeof input === 'string') {
    return { description: input };
  }
  return input;
};

export const customToast = {
  success: (input: ToastInput) => {
    const message = formatMessage(input);
    toast.success(message.description, {
      description: message.title
    });
  },
  error: (input: ToastInput) => {
    const message = formatMessage(input);
    toast.error(message.description, {
      description: message.title
    });
  },
  warning: (input: ToastInput) => {
    const message = formatMessage(input);
    toast.warning(message.description, {
      description: message.title
    });
  },
  info: (input: ToastInput) => {
    const message = formatMessage(input);
    toast.info(message.description, {
      description: message.title
    });
  },
  default: (input: ToastInput) => {
    const message = formatMessage(input);
    toast(message.description, {
      description: message.title
    });
  }
}; 