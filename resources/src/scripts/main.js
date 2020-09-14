(function () {

    var API_URL_CONFIG = {
        source: 'https://worthy-app-backend.herokuapp.com',
        auth: '/user/login',
        data_source: '/data-source', 
        data_source_entry: '/data-source/entry'
    };

    var setLogs = function (text) {

        var date = new Date();

        var format =
            date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2) + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2) + ':' +
            ('00' + date.getSeconds()).slice(-2);

        document.getElementById('logs').value += '[' + format + ']: ' + text + '\n';
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

    var requestMethodBasedOnAction = function (actionType) {

        switch (actionType) {
            case 'CREATE':
                return 'POST';
            case 'UPDATE':
                return 'PATCH';
        }

    };

    var fetchResponseHandler = function (response) {
        
        if (!response.ok) {
            return Promise.reject(response);
        }

        return response.json();

    };

    var fetchErrorHandler = function (error) {

        error.json().then(function (result) {

            alert(result.message);
            console.error(result.message);
            setLogs('DONE');
        
        });

    };

    var handleAuthAction = function () {

        var userName = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        setLogs('LOADING AUTH');

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
                document.getElementById('token').value = result.token;
                setLogs('DONE');
            })
            .catch(fetchErrorHandler);
        
    };

    var handleDataSource = function (action, event) {

        var token = document.getElementById('token').value;
        var systemName = document.getElementById('data_source_system_name').value;

        setLogs('LOADING DATA SOURCE: ' + systemName);

        var options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', 
                'X-WORTHY-APP-HEADER': 1,
                'X-WORTHY-APP-JWT': token
            }
        };

        fetch(API_URL_CONFIG.source + API_URL_CONFIG.data_source + '/' + systemName, options)
            .then(fetchResponseHandler)
            .then(function (result) {
            
                document.getElementById('current_data_source').value = systemName;
                document.getElementById('current_action').value = action;

                var fields = {};

                for (var x in result.fields) {
                    fields[result.fields[x]['systemName']] = defaultValueBasedOnDataType(result.fields[x]['dataType']);
                }

                document.getElementById('details').value = JSON.stringify({
                    "systemName": systemName,
                    "fields": fields
                }, null, 4); 

                setLogs('DONE');
            })
            .catch(fetchErrorHandler);

    };

    var handleCommit = function () {

        var token = document.getElementById('token').value;
        var action = document.getElementById('current_action').value;
        var details = document.getElementById('details').value;

        setLogs('EXECUTING COMMIT');
        setLogs(details);
        setStatus('PROCESSING');

        var options = {
            method: requestMethodBasedOnAction(action),
            headers: {
                'Content-Type': 'application/json', 
                'X-WORTHY-APP-HEADER': 1,
                'X-WORTHY-APP-JWT': token
            },
            body: details 
        };

        fetch(API_URL_CONFIG.source + API_URL_CONFIG.data_source_entry, options)
            .then(fetchResponseHandler)
            .then(function (result) {
                alert(result.message);
                setLogs('DONE');
                setStatus('IDLE');
                return;
            })
            .catch(fetchErrorHandler);

    };

    // EVENT BINDINGS
    document.getElementById('get_token').addEventListener('click', handleAuthAction);
    document.getElementById('set_create_action').addEventListener('click', handleDataSource.bind(this, 'CREATE'));
    document.getElementById('commit_action').addEventListener('click', handleCommit);

})();
