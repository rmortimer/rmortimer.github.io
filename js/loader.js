    // ************************************************************************
    // * screenPreloader                                    *
    // ************************************************************************
    setTimeout(function () {
        var root = document.getElementsByTagName('body')[0];
        root.setAttribute('class', 'loaded');
        //document.getElementById('loader-wrapper').classList.add("loaded");
    }, 5000);