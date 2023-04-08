(function () {

  var API_URL_CONFIG = {
    source: 'https://worthy-app.onrender.com',
    auth: '/user/login',
    data_source: '/data-source'
  };

  var isProcessing = false;

  var getDataSourceURL = function (systemName) {
    return API_URL_CONFIG.data_source + '/' + systemName;   
  };

  var getDataSourceEntryURL = function (systemName) {
    return API_URL_CONFIG.data_source + '/' + systemName + '/entry';
  };

  var bumpAlert = function () {
    alert('Done, please check logs for more info.');
  };

  var setLogs = function (text) {

    var date = new Date();

    var format = (
      date.getFullYear() + '-' +
      ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
      ('00' + date.getDate()).slice(-2) + ' ' +
      ('00' + date.getHours()).slice(-2) + ':' +
      ('00' + date.getMinutes()).slice(-2) + ':' +
      ('00' + date.getSeconds()).slice(-2)
    );

    var textarea = document.getElementById('logs');

    textarea.value += '[' + format + ']: ' + text + '\n';
    textarea.scrollTop = textarea.scrollHeight;

  };

  var setStatus = function (status) {
    document.getElementById('status').textContent = '[' + status.toUpperCase() + ']';
  };

  var defaultValueBasedOnDataType = function (dataType) {

    switch (dataType) {
      case 'String':
        return '';
      case 'Date':
        return '0000-00-00';
      case 'Number':
        return 0;
    }

  };

  var fetchResponseHandler = function (response) {
      
    if (!response.ok) {
      return Promise.reject(response);
    }

    return response.json();

  };

  var fetchErrorHandler = function (error) {

    var defaultErrorHandling = function (error) {
      alert('Something\'s went wrong, please try again later.');
      console.error(error);
      setLogs('(SYS MSG) RESPONSE ERROR: Something\'s went wrong, please try again later.');
      setStatus('IDLE');
      isProcessing = false;
    };

    if (error.status === 404) {
      defaultErrorHandling(error);
      return;
    }

    if (typeof error.json === 'function') {

      error.json().then(function (result) {

        document.getElementById('data_source_output').value = result.message;

        alert(result.message);
        console.error(result.message);
        setLogs('(SYS MSG) RESPONSE ERROR: ' + result.message);
        setStatus('IDLE');
        isProcessing = false;
      
      });

    } else {
      defaultErrorHandling(error);
    }

  };

  var handleAuthAction = function () {

    if (isProcessing) {
      return;
    }

    isProcessing = true;

    var userName = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    setLogs('(SYS MSG) LOADING AUTH');

    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'X-WORTHY-APP-HEADER': 1
      },
      body: JSON.stringify({
        'userName': userName, 
        'password': password
      })
    };
    
    fetch(API_URL_CONFIG.source + API_URL_CONFIG.auth, options)
      .then(fetchResponseHandler)
      .then(function (result) {
        bumpAlert();
        document.getElementById('token').value = result.token;
        setLogs('(SYS MSG) SUCCESS RESPONSE: Done, please check the Token field.');
        isProcessing = false;
      })
      .catch(fetchErrorHandler);

  };

  var handleDataSource = function (action) {

    if (isProcessing) {
      return;
    }

    isProcessing = true;

    var token = document.getElementById('token').value;
    var systemName = document.getElementById('data_source_system_name').value;

    setLogs('(SYS MSG) LOADING DATA SOURCE: ' + systemName + ' with action ' + action);

    var postActionResponse = function () {

      document.getElementById('data_source_form_body').hidden = false;
      document.getElementById('data_source_url').value = API_URL_CONFIG.source + getDataSourceEntryURL(systemName);
      document.getElementById('data_source_action').value = action;

      var url = API_URL_CONFIG.source + getDataSourceURL(systemName);

      var options = {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json', 
              'X-WORTHY-APP-HEADER': 1,
              'X-WORTHY-APP-JWT': token
          }
      };

      fetch(url, options)
        .then(fetchResponseHandler)
        .then(function (result) {

          bumpAlert();

          var fields = {};
          for (var x in result.fields) {
              fields[result.fields[x]['systemName']] = defaultValueBasedOnDataType(result.fields[x]['dataType']);
          }

          document.getElementById('data_source_body').value = JSON.stringify(fields, null, 2);

          setLogs('(SYS MSG) SUCCESS RESPONSE: Done, Please check the Data Source Body field.');
          isProcessing = false;

        })
        .catch(fetchErrorHandler);

    };

    var getActionResponse = function () {

      document.getElementById('data_source_form_body').hidden = true;
      document.getElementById('data_source_url').value = API_URL_CONFIG.source + getDataSourceEntryURL(systemName);
      document.getElementById('data_source_action').value = action;
      document.getElementById('data_source_output').value = '';

      isProcessing = false;

    };

    if (action === 'POST') {
      postActionResponse();
    } else if (action === 'GET') {
      getActionResponse();
    }

  };

  var handleCommit = function () {

    if (isProcessing) {
      return;
    }

    setLogs('(SYS MSG) COMMIT ACTION TRIGGERED');
    setStatus('PROCESSING');

    isProcessing = true;

    document.getElementById('data_source_output').value = '';

    var token = document.getElementById('token').value;
    var dataSourceUrl = document.getElementById('data_source_url').value;
    var dataSourceAction = document.getElementById('data_source_action').value;
    var dataSourceBody = document.getElementById('data_source_body').value;

    setLogs('Action: ' + dataSourceAction);
    if (dataSourceAction === 'POST') {
      setLogs('Request Body: \n' + dataSourceBody);
    }

    var options = {
      method: dataSourceAction,
      headers: {
        'Content-Type': 'application/json', 
        'X-WORTHY-APP-HEADER': 1,
        'X-WORTHY-APP-JWT': token
      } 
    };

    if (dataSourceAction === 'POST' || dataSourceAction === 'PATCH') {
      options['body'] = dataSourceBody;
    }

    fetch(dataSourceUrl, options)
      .then(fetchResponseHandler)
      .then(function (result) {
        bumpAlert();
        document.getElementById('data_source_output').value = JSON.stringify(result, null, 4);
        setLogs('(SYS MSG) SUCCESS RESPONSE: Done, Please check the Output field.');
        setStatus('IDLE');
        isProcessing = false;
      })
      .catch(fetchErrorHandler);

  };

  // EVENT BINDINGS
  document.getElementById('get_token').addEventListener('click', handleAuthAction);
  document.getElementById('set_get_action').addEventListener('click', handleDataSource.bind(this, 'GET'));
  document.getElementById('set_post_action').addEventListener('click', handleDataSource.bind(this, 'POST'));
  document.getElementById('commit_action').addEventListener('click', handleCommit);

})();
