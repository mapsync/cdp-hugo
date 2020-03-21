import React from "react";
import CMS from "netlify-cms-app";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.css";

import HomePreview from "./cms-preview-templates/home";
import PostPreview from "./cms-preview-templates/post";
import ProductsPreview from "./cms-preview-templates/products";
import ValuesPreview from "./cms-preview-templates/values";
import ContactPreview from "./cms-preview-templates/contact";

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("home", HomePreview);
CMS.registerPreviewTemplate("post", PostPreview);
CMS.registerPreviewTemplate("products", ProductsPreview);
CMS.registerPreviewTemplate("values", ValuesPreview);
CMS.registerPreviewTemplate("contact", ContactPreview);

const style = {
  send: {
    border: '0',
    background: 'rgb(23, 162, 184)',
    color: 'white',
    'font-weight': '500',
    height: '36px',
    'line-height': '36px',
    padding: '0 40px 0 20px',
    width: '200px',
    cursor: 'pointer'
  }
}

const encode = function (data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

var NotificationControl = class Control extends React.Component {
  state = {
    message: "Submit",
    disabled: false
  }

  handleClick(history, idString) {
    var id = parseInt(idString.split("-")[2]);
    var self = this;
    self.setState({
      message: "Sending...",
      disabled: true
    });
    var link = document.getElementById("link-field-" + (id - 1)).value;
    if (link.startsWith("https://cityofhodgenvilleky.geosync.cloud")) {
      var url = new URL(link);
      link = "https://cityofhodgenvilleky.netlify.com" + url.pathname + url.search
    }
    else if (link == "" || link.startsWith("https://cityofhodgenvilleky.geosync.cloud/admin") ) {
      link = "https://cityofhodgenvilleky.netlify.com"
    }
    var delivery = new Date().toISOString();
    var date = new Date(document.getElementById("delivery-field-" + (id - 5)).value);
    if (date) {
      delivery = date.toISOString();
    }
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": "notification",
        "account": "cityofhodgenvilleky",
        "title": document.getElementById("title-field-" + (id - 6)).value,
        "delivery": delivery,
        "priority": document.getElementById("priority-field-" + (id - 4)).getAttribute("aria-checked"),
        "sound": document.getElementById("sound-field-" + (id - 3)).getAttribute("aria-checked"),
        "message": document.getElementById("message-field-" + (id - 2)).value,
        "link": link
      })
    })
      .then(function () {
        self.setState({
          message: "Success!"
        });
        setTimeout(function () {
          document.getElementById("title-field-" + (id - 6)).value = "";
          history.push('/collections/notification');
        }, 3000)
      })
      .catch(function (error) {
         alert(error);
         self.setState({
          message: "Submit",
          disabled: false
        });
      });
  }

  render() {
    const {
      forID
    } = this.props;
    return (
      <div>
        <Helmet>
            <style type="text/css">{`
              [role="button"]
              {
                  display: none;
              }
            `}</style>
          </Helmet>
        <Route render={({ history}) => (
          <button style={style.send} disabled={this.state.disabled} onClick={() => { this.handleClick(history, forID); }} type="button">
          { this.state.message }
          </button>
        )} />
      </div>
    );
  }
}

CMS.registerWidget('notification', NotificationControl)
CMS.init();
