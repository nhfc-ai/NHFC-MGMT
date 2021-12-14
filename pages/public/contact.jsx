import React from 'react';

import withAuth from '../../lib/withAuth';
import ContactByGmail from '../../components/public/ContactByGmail';

function Contact() {
  //   contactOnSave = async (subject, content) => {
  //     NProgress.start();
  //     try {
  //       console.log(['contactOnSave', subject, content]);
  //       this.setState({ subject, content });
  //       const gmailRes = await sendEmailByGmailAPI(this.state.subject, this.state.content);
  //       console.log(gmailRes);
  //       if (gmailRes.length > 0) {
  //         notify('Message sent out.');
  //       }
  //       NProgress.done();
  //       notify('Redirecting to the main page shortly.');
  //       setTimeout(() => {
  //         Router.push('/');
  //       }, 5000);
  //     } catch (err) {
  //       notify(err.message || err.toString());
  //       NProgress.done();
  //     }
  //   };
  return (
    <div style={{ padding: '10px 45px' }}>
      <ContactByGmail />
    </div>
  );
}

// Contact.propTypes = propTypes;

export default withAuth(Contact, { contactRequired: true });
