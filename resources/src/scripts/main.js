(function () {

    var API_URL_CONFIG = {
        source: 'https://worthy-app-backend.herokuapp.com',
        auth: '/user/login',
        data_source: '/data-source', 
        data_source_entry: '/data-source/entry'
    };

    var setStatusText = function (text) {

        var status = document.getElementById('status');
        
        if (text === 'IDLE') {
            status.classList.remove('-processing');
            status.classList.add('-idle');
        } else {
            status.classList.remove('-idle');
            status.classList.add('-processing');
        }

        status.textContent = text;
        
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

    var handleAuthAction = function () {

        var userName = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        setStatusText('LOADING AUTH...');
        
        fetch(API_URL_CONFIG.source + API_URL_CONFIG.auth,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'X-WORTHY-APP-HEADER': 1
                },
                body: JSON.stringify({
                    'userName': userName, 
                    'password': password
                })
            }
        )
        .then(function (response) {
            
            if (!response.ok) {
                throw new Error('Please check network response.');
            }

            return response.json();

        })
        .then(function (result) {
            document.getElementById('token').value = result.token;

            setStatusText('IDLE');
        })
        .catch(function (error) {
          console.error('Error:', error);
          setStatusText('IDLE');
        });
        
    };

    var handleDataSource = function (action, event) {

        var token = document.getElementById('token').value;
        var systemName = document.getElementById('data_source_system_name').value;

        setStatusText('LOADING DATA SOURCE...');

        fetch(API_URL_CONFIG.source + API_URL_CONFIG.data_source + '/' + systemName,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', 
                    'X-WORTHY-APP-HEADER': 1,
                    'X-WORTHY-APP-JWT': token
                }
            }
        )
        .then(function (response) {

            if (!response.ok) {
                throw new Error('Please check network response.');
            }

            return response.json();
        })
        .then(function (result) {

            if (!result || typeof result.fields === 'undefined') {
                throw new Error('Please check network response.');
            }
           
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

            setStatusText('IDLE');

        })
        .catch(function (error) {
          console.error('Error:', error);
          setStatusText('IDLE');
        });

    };

    var handleCommit = function () {

        var token = document.getElementById('token').value;
        var action = document.getElementById('current_action').value;
        var details = document.getElementById('details').value;

        setStatusText('LOADING COMMIT...');

        fetch(API_URL_CONFIG.source + API_URL_CONFIG.data_source_entry,
            {
                method: requestMethodBasedOnAction(action),
                headers: {
                    'Content-Type': 'application/json', 
                    'X-WORTHY-APP-HEADER': 1,
                    'X-WORTHY-APP-JWT': token
                },
                body: details 
            }
        )
        .then(function (response) {

            if (!response.ok) {
                throw new Error('Please check network response.');
            }

            return response.json();
        })
        .then(function (result) {
            alert(result.message);
            setStatusText('IDLE');
        })
        .catch(function (error) {
          console.error('Error:', error);
          setStatusText('IDLE');
        });

    };

    document.getElementById('get_token').addEventListener('click', handleAuthAction);
    document.getElementById('set_create_action').addEventListener('click', handleDataSource.bind(this, 'CREATE'));
    document.getElementById('commit_action').addEventListener('click', handleCommit);

})();
