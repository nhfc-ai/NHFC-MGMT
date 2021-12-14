import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import { Box, Button, TextField } from '@mui/material';
import notify from '../../lib/notify';
import { sendEmailByGmailAPI } from '../../lib/api/public';

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = { subject: ``, content: `` };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.subject.length === 0) {
      notify('Subject is required.');
      return;
    }
    if (this.state.content.length === 0) {
      notify('Content is required.');
      return;
    }
    // const gmailRes = await sendEmailByGmailAPI(this.state.subject, this.state.body);
    // console.log(gmailRes);

    // notify('Sent! the page is going back to the main page.');
    // setTimeout(() => {
    //   Router.push('/');
    // }, 5000);

    this.contactOnSave(this.state.subject, this.state.content);
  }

  contactOnSave = async (subject, content) => {
    NProgress.start();
    try {
      const gmailRes = await sendEmailByGmailAPI({ subject, content });
      // console.log(gmailRes.status);
      if (gmailRes.status === 200) {
        notify('Message sent out. Redirecting to the main page shortly.');
      } else {
        notify('Redirecting to the main page shortly.');
      }
      NProgress.done();
      setTimeout(() => {
        Router.push('/');
      }, 5000);
    } catch (err) {
      notify(err.message || err.toString());
      NProgress.done();
    }
  };

  render() {
    return (
      <Box sx={{ width: 500, maxWidth: '100%' }}>
        <div style={{ padding: '10px 45px' }}>
          <h3>Sending a message to the developer.</h3>
          <form onSubmit={this.handleSubmit}>
            <TextField
              fullWidth
              id="contact-subject"
              label="Subject"
              onChange={(event) => {
                this.setState({ subject: event.target.value });
              }}
              value={this.state.subject}
            />
            <br />
            <br />
            <TextField
              fullWidth
              id="contact-content"
              label="Description"
              multiline
              rows={10}
              onChange={(event) => {
                this.setState({ content: event.target.value });
              }}
              value={this.state.content}
            />
            <br />
            <br />
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </form>
        </div>
      </Box>
    );
  }
}

export default Contact;
