import { FC } from 'react';
import { MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

interface EmailRowProps {
  title: string;
  to: number;
  status: 'Sent' | 'Draft' | 'Error';
  openRate: string;
  totalClick: number;
  bounceRate: string;
  replyRate: string;
  preview: string;
}

const EmailRow: FC<EmailRowProps> = ({
  title,
  to,
  status,
  openRate,
  totalClick,
  bounceRate,
  replyRate,
  preview
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      case 'Draft':
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
      case 'Error':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const getMetricTrend = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue > 40) {
      return {
        icon: <ChevronUp className="w-3 h-3 text-emerald-500" />,
        color: 'text-emerald-500'
      };
    }
    return {
      icon: <ChevronDown className="w-3 h-3 text-red-500" />,
      color: 'text-red-500'
    };
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="max-w-md">
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500 truncate">{preview}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{to}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-900">{openRate}</span>
          {getMetricTrend(openRate).icon}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{totalClick}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-900">{bounceRate}</span>
          {getMetricTrend(bounceRate).icon}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-900">{replyRate}</span>
          {getMetricTrend(replyRate).icon}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default EmailRow; 