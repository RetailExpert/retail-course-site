const SUPABASE_URL = 'https://mkoblrxtitrvxwsfubjd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DaJiN_25cKFyc-h39Z219g_ZKScPaMN';

const WHATSAPP_NUMBER = '27748315232';
const CALLMEBOT_API_KEY = 'YOUR_CALLMEBOT_KEY';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { event_type, referrer } = JSON.parse(event.body);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/page_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ event_type, referrer })
    });

    if (event_type === 'payment_click' && CALLMEBOT_API_KEY !== 'YOUR_CALLMEBOT_KEY') {
      const msg = encodeURIComponent(`💰 RetailExpert: Someone just clicked BUY NOW! Source: ${referrer || 'Direct'}`);
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${msg}&apikey=${CALLMEBOT_API_KEY}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
