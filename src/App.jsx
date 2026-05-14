import { useState, useRef, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import classNames from 'classnames';
import Background from './components/Background.jsx'
import Cashu from './components/Cashu.jsx'
import Lightning from './components/Lightning.jsx'
import SizeSelector from './components/SizeSelector.jsx'
import PwaModal from './components/PwaModal.jsx'
import { Error } from './components/Status.jsx';
import { AccessGrantedIcon, RadioButtonIcon } from './components/Icon.jsx'
import { fetchTollgateData, getStepSizeValues } from './helpers/tollgate.js'
import { useTheme } from './theme/ThemeProvider';
import './App.scss'

export const App = () => {
  const { t, ready } = useTranslation();
  const theme = useTheme();
  const [method, setMethod] = useState('cashu');
  const [tollgateDetails, setTollgateDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const retryIntervalRef = useRef(null);
  const [selectedAmount, setSelectedAmount] = useState(null);

  // initial data fetch on translation ready
  useEffect(() => {
    if (ready) {
      const fetch = async () => {
        setLoading(true);
        const response = await fetchTollgateData(t);

        if (!response.status) {
          setRetrying(true);
          setError(response);
        } else {
          setTollgateDetails(response);
        }

        setLoading(false);
      };

      fetch();

      // cleanup on unmount
      return () => {
        if (retryIntervalRef.current) {
          clearInterval(retryIntervalRef.current);
        }
      };
    }
  }, [ready]);

  // set up retry mechanism when there's an error
  useEffect(() => {
    // only set up retry if there's an error and no existing retry interval
    if (!error || tollgateDetails || retryIntervalRef.current) {
      return;
    }

    console.log('setting up retry interval for tollgate details');
    setRetrying(true);

    // set up the retry interval
    retryIntervalRef.current = setInterval(async () => {
      console.log('retrying to fetch tollgate details...');
      const response = await fetchTollgateData(t);

      // if successful, clear the interval
      if (response.status) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
        setTollgateDetails(response);
        setRetrying(false);
        setError(false);
      }
    }, 5000);

    // cleanup function
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    };
  }, [error, tollgateDetails]);

  // main render
  return (
    <div id="tollgate-captive-portal" className="tollgate-captive-portal">
      <Background />

      <div className="tollgate-captive-portal-interface">
        {theme.features.pwaModal && <PwaModal />}
        <Header />

        {!loading && !error && tollgateDetails && theme.features.sizeSelector && <SizeSelector
          tollgateDetails={tollgateDetails.value}
          selectedAmount={selectedAmount}
          setSelectedAmount={setSelectedAmount}
        />}

        <div className="tollgate-captive-portal-content">
          <div className="tollgate-captive-portal-content-container">

            <div className="tollgate-captive-portal-tabs" aria-label={t('tab_aria_label')}>
              <Tab type="cashu" method={method} setMethod={setMethod} />
              <Tab type="lightning" method={method} setMethod={setMethod} />
            </div>

            <div className="tollgate-captive-portal-view">
              {loading && <Loading />}

              {!loading && error && <div className="tollgate-captive-portal-error">
                <Error label={error.label} code={error.code} message={error.message} />
              </div>}

              {/* show cashu or lightning method based on selection */}
              {!loading && !error && method === 'cashu' && <Cashu tollgateDetails={tollgateDetails.value} selectedAmount={selectedAmount} />}
              {!loading && !error && method === 'lightning' && <Lightning tollgateDetails={tollgateDetails.value} selectedAmount={selectedAmount} />}
            </div>

          </div>
        </div>

        <Footer />
      </div>

    </div>
  );
}

export const Header = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return <div className="tollgate-captive-portal-header">
    <img src={theme.brand.logo} alt={t('header_image_alt')}></img>
  </div>
}

// tab component for the container header
const Tab = ({ type, method, setMethod }) => {
  const { t } = useTranslation();
  const isDisabled = false;

  return <button
    onClick={() => !isDisabled && setMethod(type)}
    data-active={method === type}
    data-disabled={isDisabled}
    className={`tollgate-captive-portal-tabs-tab tollgate-captive-portal-tabs-tab-${type} ellipsis ${isDisabled ? 'disabled' : ''}`}
    label={t(`${type}_tab`)}
    id={`tab-${type}`}
    aria-controls={`tab-${type}`}
    disabled={isDisabled}>
    {t(`${type}_tab`)}
  </button>
}

// loading component shows a spinner
export const Loading = () => {
  const { t } = useTranslation();

  return <div className="tollgate-captive-portal-loading">
    <span className="spinner big"></span>
    {t('loading')}
  </div>
}

// processing component shows a spinner
export const Processing = ({ label }) => {
  const { t } = useTranslation();

  if (!label || "string" !== typeof label || !label.length) label = t('processing')

  return <div className="tollgate-captive-portal-processing">
    <span className="spinner big"></span>
    {label}
  </div>
}

// shows access granted message if payment succeeded
export const AccessGranted = ({ allocation }) => {
  const { t } = useTranslation();
  const [showOpenBalanceButton, setShowOpenBalanceButton] = useState(false);
  const balanceUrl = '/balance.html';

  // Redirect to the balance page shortly after a successful payment.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.location.assign(balanceUrl);
      } catch (error) {
        console.error('Failed to redirect to balance page:', error);
        setShowOpenBalanceButton(true);
      }
    }, 900);

    const fallbackTimer = setTimeout(() => {
      setShowOpenBalanceButton(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return <div className="tollgate-captive-portal-access-granted">
    <div className="tollgate-captive-portal-access-granted-checkmark">
      <AccessGrantedIcon />
    </div>
    <div className="tollgate-captive-portal-access-granted-label">
      <h2>{t('access_granted_title')}</h2>
      <p dangerouslySetInnerHTML={{ __html: t('access_granted_subtitle', { purchased: `<strong>${allocation}</strong>` }) }}></p>
      {!showOpenBalanceButton ? (
        <>
          <p className="small">{t('auto_redirect_message')}</p>
        </>
      ) : (
        <>
          <a href={balanceUrl} className="btn cta">{t('open_balance_page')}</a>
        </>
      )}
    </div>
  </div>
}

export const Footer = () => {
  const theme = useTheme();
  return <div className="tollgate-captive-portal-footer">
    <p>{theme.brand.name} · Powered by <a href={theme.brand.poweredByUrl} target="_blank" rel="noreferrer">{theme.brand.poweredByText}</a></p>
  </div>
}

// mint access options component
export const AccessOptions = ({ pricingInfo, selectedMint, setSelectedMint }) => {
  const { t } = useTranslation();
  return <>
    {/* render a button for each available mint option */}
    {pricingInfo.length && pricingInfo.map(mint => {
      if (!mint.price || !mint.url) return null;
      let mintAddressStripped = mint.url.replace('https://', '');
      mintAddressStripped = mintAddressStripped.replace('http://', '');

      const stepSizeInfo = getStepSizeValues(mint, t);
      const formattedStepSize = stepSizeInfo ? `${stepSizeInfo.value} ${stepSizeInfo.unit}` : "[step_size_formatted]";
      const pricePerStep = mint.price / (mint.min_steps || 1);
      let mintPriceFormatted = `${pricePerStep.toFixed((pricePerStep % 1 !== 0) ? 2 : 0)} ${mint.unit} / ${formattedStepSize}`;

      return <button
        key={mintAddressStripped}
        className={classNames('ghost', 'ellipsis', { 'cta active': mint.url === selectedMint.url })}
        onClick={() => {
          setSelectedMint(mint);
        }}>
        <span className="mint-price ellipsis">
          <RadioButtonIcon />
          {mint.price} {mint.unit}
        </span>
        <span className="mint-meta">
          <span className="mint-meta-address">{mintAddressStripped}</span>
          <span className="mint-meta-price-per-step">{mintPriceFormatted}</span>
        </span>
      </button>
    })}
  </>
}

export default App
