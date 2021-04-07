(function() {

    const baseUrl = `https://${getAllyHostname()}`;

    $(document).ready(function() {
        $('button').click(loadAlly)
    });

    function loadAlly() {
        const clientId = getClientId();
        const applicationSecret = getApplicationSecret();
        const contentHash = getContentHash();
        const downloadUrl = getDownloadUrl();
        console.log(`Client id: ${clientId}`);
        console.log(`Application secret: ${applicationSecret}`);
        console.log(`Content hash: ${contentHash}`);
        console.log(`Download url: ${downloadUrl}`);
        if (!clientId || !applicationSecret || !contentHash || !downloadUrl) {
            window.alert('Missing data');
            return;
        }

        $('#source').attr('data-ally-aaas-content-hash', contentHash);
        $('#source').attr('data-ally-download-url', downloadUrl);

        const policy = generateFormatRequestPolicy(contentHash);
        const token = generateSignature(clientId, applicationSecret, policy);
        console.log('Policy:')
        console.log(JSON.stringify(policy, null, 2));
        console.log(`Token: ${token}`);

        document.getElementById('loading').style.display = 'block';

        // Fire up thge Ally UI
        if (!window.ui) {
            window.ui = true;
            ally.ready(function() {
                window.ui = ally.ui({
                    'client': {
                        'auth': (hashId) => {
                            return Promise.resolve({'bearer': token})
                        },
                        'baseUrl': baseUrl,
                        'clientId': getClientId()
                    },
                    'locale': 'en-US',
                    'platformName': 'AaaS',
                    'role': 'instructor'
                });
                window.ui.autoUpdate();
            });
        }
    }

    function generateSignature(clientId, applicationSecret, policy) {
        // Header
        var oHeader = {alg: 'HS256', typ: 'JWT'};
        // Payload
        var oPayload = {'policy': policy};
        var tNow = KJUR.jws.IntDate.get('now');
        oPayload.iat = tNow;
        oPayload.clientId = clientId;
        // Sign JWT, password=616161
        var sHeader = JSON.stringify(oHeader);
        var sPayload = JSON.stringify(oPayload);
        return KJUR.jws.JWS.sign("HS256", sHeader, sPayload, applicationSecret);
    }

    function generateBatchPolicy() {
        return {
            'statements': [
                {
                    "resource": "content:*",
                    "actions": ["content:getDetails", "content:getDetails:withFormats", "content:getFormat"]
                }
            ]
        }
    }

    function generateFormatRequestPolicy(hash) {
        return {
            'statements': [
                {
                    "resource": `content:${hash}`,
                    "actions": [
                        "content:getDetails",
                        "content:getDetails:withFormats",
                        "content:getFormat"
                    ]
                }
            ]
        }
    }

    function generateAllowAllPolicy(hash) {
        return {
            'statements': [
                {
                    "resource": `content:*`,
                    "actions": [
                        "content:*",
                        "content:*:*"
                    ]
                }
            ]
        }
    }

    function getClientId() {
        return $('#clientId').val();
    }

    function getApplicationSecret() {
        return $('#applicationSecret').val();
    }

    function getContentHash () {
        return $('#contentHash').val();
    }

    function getAllyHostname() {
        return $('script[data-ally-loader]').attr('src').split('/')[2];
    }

})();