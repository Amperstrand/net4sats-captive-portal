import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAccessOptions } from '../helpers/tollgate';
import './SizeSelector.scss';

const SizeSelector = ({ tollgateDetails, selectedAmount, setSelectedAmount }) => {
  const { t } = useTranslation();
  const [activePreset, setActivePreset] = useState(null);
  const [customValue, setCustomValue] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const accessOptions = useMemo(() => {
    if (!tollgateDetails || !tollgateDetails.detailsEvent) return [];
    return getAccessOptions(tollgateDetails.detailsEvent, t);
  }, [tollgateDetails, t]);

  const firstOption = accessOptions.length ? accessOptions[0] : null;

  const { mode, presets } = useMemo(() => {
    if (!firstOption) return { mode: null, presets: [] };

    const { metric, step_size, price } = firstOption;

    if (metric === 'milliseconds') {
      const fifteenMinSteps = Math.ceil((15 * 60 * 1000) / step_size);
      const oneHourSteps = Math.ceil((60 * 60 * 1000) / step_size);
      const tenHourSteps = Math.ceil((10 * 60 * 60 * 1000) / step_size);

      return {
        mode: 'time',
        presets: [
          { label: '15 min', steps: fifteenMinSteps, amount: price * fifteenMinSteps },
          { label: '1 hour', steps: oneHourSteps, amount: price * oneHourSteps },
          { label: '10 hours', steps: tenHourSteps, amount: price * tenHourSteps },
        ]
      };
    }

    if (metric === 'bytes') {
      const hundredMBSteps = Math.ceil((100 * 1048576) / step_size);
      const oneGBSteps = Math.ceil((1073741824) / step_size);
      const tenGBSteps = Math.ceil((10 * 1073741824) / step_size);

      return {
        mode: 'data',
        presets: [
          { label: '100 MB', steps: hundredMBSteps, amount: price * hundredMBSteps },
          { label: '1 GB', steps: oneGBSteps, amount: price * oneGBSteps },
          { label: '10 GB', steps: tenGBSteps, amount: price * tenGBSteps },
        ]
      };
    }

    return { mode: null, presets: [] };
  }, [firstOption]);

  useEffect(() => {
    if (presets.length && selectedAmount === null) {
      setActivePreset(0);
      setSelectedAmount(presets[0].amount);
    }
  }, [presets]);

  const handlePresetClick = (index) => {
    setActivePreset(index);
    setShowCustom(false);
    setCustomValue('');
    setSelectedAmount(presets[index].amount);
  };

  const handleMoreClick = () => {
    setActivePreset(null);
    setShowCustom(true);
    setCustomValue('');
    setSelectedAmount(null);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomValue(val);
    if (val && !isNaN(Number(val)) && Number(val) > 0) {
      setSelectedAmount(Number(val));
    } else {
      setSelectedAmount(null);
    }
  };

  if (!mode || !presets.length) return null;

  const unitLabel = mode === 'time' ? t('sat') : t('sat');
  const minPurchase = presets.length ? presets[0].label : '';

  return (
    <div className="tollgate-captive-portal-size-selector">
      <p className="tollgate-captive-portal-size-selector-heading">How much Internet would you like to buy?</p>
      <p className="tollgate-captive-portal-size-selector-subheading">Minimum purchase: {minPurchase}</p>
      <div className="tollgate-captive-portal-size-selector-pills">
        {presets.map((preset, i) => (
          <button
            key={i}
            className={`tollgate-captive-portal-size-selector-pill ${activePreset === i ? 'active' : ''}`}
            onClick={() => handlePresetClick(i)}
          >
            {preset.label}
          </button>
        ))}
        <button
          className={`tollgate-captive-portal-size-selector-pill ${showCustom ? 'active' : ''}`}
          onClick={handleMoreClick}
        >
          More
        </button>
      </div>
      {showCustom && (
        <div className="tollgate-captive-portal-size-selector-custom">
          <input
            type="number"
            min="1"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="Enter amount"
            className="tollgate-captive-portal-size-selector-custom-input"
          />
          <span className="tollgate-captive-portal-size-selector-custom-unit">sats</span>
        </div>
      )}
    </div>
  );
};

export default SizeSelector;
