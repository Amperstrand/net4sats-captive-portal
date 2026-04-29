import { formatDataSize, formatTimeInSeconds, getTollgateBaseUrl } from './tollgate';

const balanceError = (i18n, code, fallbackMessage, message) => ({
  status: 0,
  code,
  label: i18n(`${code}_label`),
  message: message || i18n(`${code}_message`) || fallbackMessage,
});

export const fetchBalanceData = async (i18n = (k) => k) => {
  try {
    const baseUrl = getTollgateBaseUrl();
    const response = await fetch(`${baseUrl}/balance`);
    const payload = await response.json();

    if (!response.ok || !payload.status) {
      return balanceError(i18n, 'BG001', 'Could not fetch balance details.', payload?.error);
    }

    return {
      status: 1,
      value: payload,
    };
  } catch (error) {
    console.error('error fetching balance data:', error);
    return balanceError(i18n, 'BG002', 'Could not fetch balance details.');
  }
};

export const formatMetricValue = (amount, metric, i18n = (k) => k) => {
  if (metric === 'milliseconds') {
    return formatTimeInSeconds(amount, false, i18n);
  }
  if (metric === 'bytes') {
    return formatDataSize(amount, i18n);
  }

  return {
    value: amount,
    unit: metric || '',
  };
};

export const getMetricLabel = (metric, i18n = (k) => k) => {
  if (metric === 'milliseconds') {
    return i18n('balance_metric_time');
  }
  if (metric === 'bytes') {
    return i18n('balance_metric_data');
  }

  return metric || i18n('balance_metric_unknown');
};
