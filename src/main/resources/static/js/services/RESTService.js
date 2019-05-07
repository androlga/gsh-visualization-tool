import axios from 'axios'

export default class RESTService {
     getGsh(rows, successCallback) {
        axios.post(restConfig.restEndpointBaseURL + '/gsh', {
            rows: rows
        }).then((response) => {
            if (response.status == "200") {
                successCallback(response);
            }
        })
            .catch((e) => {
                console.error(e)
            });
    }
}