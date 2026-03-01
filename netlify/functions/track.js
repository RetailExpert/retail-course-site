const SUPABASE_URL = 'https://mkoblrxtitrvxwsfubjd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DaJiN_25cKFyc-h39Z219g_ZKScPaMN';
const WHATSAPP_NUMBER = '27748315232';
const CALLMEBOT_API_KEY = '4988567';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET request - return analytics data for dashboard
  if (event.httpMethod === 'GET') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/page_events?select=*&order=created_at.desc&limit=500`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.text();
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: data
    };
  }

  // POST request - save tracking event
  try {
    const { event_type, referrer } = JSON.parse(event.body);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/page_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ event_type, referrer })
    });

    const resText = await res.text();
    console.log('Supabase response:', res.status, resText);

    if (event_type === 'payment_click' && CALLMEBOT_API_KEY !== '4988567') {
      const msg = encodeURIComponent(`💰 RetailExpert: Someone just clicked BUY NOW! Source: ${referrer || 'Direct'}`);
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${msg}&apikey=${CALLMEBOT_API_KEY}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, supabase_status: res.status })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
