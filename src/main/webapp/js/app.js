(function() {
    var r = new Flow({
        //target: '/upload',
    	target:'http://upload-flowjs-java.mybluemix.net/upload',
//    	target:'http://upload-flowjs-node.mybluemix.net/upload',
        chunkSize: 1024 * 1024,
        testChunks: false,
        permanentErrors : [ 500, 501 ],
		maxChunkRetries : 3,
		chunkRetryInterval : 5000,
		simultaneousUploads : 1,
		progressCallbacksInterval : 1,
		//testChunks : false,
		method : "octet",
        query: function(file) {
            return {
                user: window.user
            }
        }
    });
    // Flow.js isn't supported, fall back on a different method
    if (!r.support) {
        $('.flow-error').show();
        return;
    }
    // Show a place for dropping/selecting files
    $('.flow-drop').show();
    r.assignDrop($('.flow-drop')[0]);
    r.assignBrowse($('.flow-browse')[0]);
    r.assignBrowse($('.flow-browse-folder')[0], true);
    r.assignBrowse($('.flow-browse-image')[0], false, false, {
        accept: 'image/*'
    });

    $('.flow-progress, .flow-list').hide();

    r.on('fileAdded', function(file) {

        $(".list-group").loadTemplate($("#template"), {
            'file': "flow-file-" + file.uniqueIdentifier,
            'flow-file-name': file.name,
            'flow-file-size': readablizeBytes(file.size),
            'flow-file-download': '/download/' + file.uniqueIdentifier + "/user/" + user
        }, { append: true });

        var $self = $(".flow-file-" + file.uniqueIdentifier);

        $self.find('.flow-file-pause').on('click', function() {
            file.pause();
            $self.find('.flow-file-pause').hide();
            $self.find('.flow-file-resume').show();
        });
        $self.find('.flow-file-resume').on('click', function() {
            file.resume();
            $self.find('.flow-file-pause').show();
            $self.find('.flow-file-resume').hide();
        });
        $self.find('.flow-file-cancel').on('click', function() {
            file.cancel();
            $self.remove();
        });

        $self.find('.flow-file-pause').hide();
        $self.find('.flow-file-resume').hide();
        $self.find('.flow-file-download').hide();

    });
    r.on('filesSubmitted', function(files, event) {

        var promises = files.map(function(file) {
        	console.log("user: "+user);
            console.log("filename: "+file.name);
            console.log("uniqueid: "+file.uniqueIdentifier);
            console.log("chunks: "+file.chunks.length);
            return $.ajax({
                type: "POST",
                url: "/prepare",
                //contentType: 'application/json; charset=utf-8',
                dataType: "json",
                data: {
                    "user": user,
                    "name": file.name,
                    "uniqueIdentifier": file.uniqueIdentifier,
                    "size": file.chunks.length
                }
            })
        })
   
        $.when.apply($, promises)
        	.done(function(response) {
        		console.log("scrittura db DONE");
                files.forEach(function(file){
                    var $self = $('.flow-file-' + file.uniqueIdentifier);
                    $self.find('.flow-file-pause').show();
                    $self.find('.flow-file-resume').show();
                })
            })
    
            .fail(function(reject) {
                var $self = $("#messages").loadTemplate($("#alert-template"));
                console.log("Qualcosa non e' andato a buon fine ..."+promises);
            });
    });
    r.on('complete', function() {
        // Hide pause/resume when the upload has completed
        $('.flow-progress .progress-resume-link, .flow-progress .progress-pause-link').hide();
    });
    r.on('fileSuccess', function(file, message) {

        $.ajax({
                type: "PUT",
                url: "/confirm",
                //contentType: 'application/json; charset=utf-8',
                dataType: "json",
                data: {
                    "user": user,
                    "uniqueIdentifier": file.uniqueIdentifier
                }
            }).done(function() {
                var $self = $('.flow-file-' + file.uniqueIdentifier);
                // Reflect that the file upload has completed
                $self.find('.flow-file-progress').text('(completed)');
                $self.find('.flow-file-pause, .flow-file-resume').remove();
                $self.find('.flow-file-download').attr('href', '/download/' + file.uniqueIdentifier + "/user/" + user).show();
            })
            .fail(function() {
                console.log("Qualcosa non e' andato a buon fine ...");
            });
    });
    r.on('fileError', function(file, message) {
        // Reflect that the file upload has resulted in error
        $('.flow-file-' + file.uniqueIdentifier + ' .flow-file-progress').html('(file could not be uploaded: ' + message + ')');
    });
    r.on('fileProgress', function(file) {
        // Handle progress for both the file and the overall upload
        $('.flow-file-' + file.uniqueIdentifier + ' .flow-file-progress')
            .html(Math.floor(file.progress() * 100) + '% ' +
                readablizeBytes(file.averageSpeed) + '/s ' +
                secondsToStr(file.timeRemaining()) + ' remaining');
        $('.progress-bar').css({
            width: Math.floor(r.progress() * 100) + '%'
        });
    });
    r.on('uploadStart', function() {
        // Show pause, hide resume
        $('.flow-progress .progress-resume-link').hide();
        $('.flow-progress .progress-pause-link').show();
    });
    r.on('catchAll', function() {
        console.log.apply(console, arguments);
    });
    window.r = {
        pause: function() {
            r.pause();
            // Show resume, hide pause
            $('.flow-file-resume').show();
            $('.flow-file-pause').hide();
            $('.flow-progress .progress-resume-link').show();
            $('.flow-progress .progress-pause-link').hide();
        },
        cancel: function() {
            r.cancel();
            $('.flow-file').remove();
        },
        upload: function() {
            $('.flow-file-pause').show();
            $('.flow-file-resume').hide();
            r.resume();
        },
        flow: r
    };

    $("#user").blur(function(event) {
        window.user = $("#user").val();
        if(window.user) {
          $("#uploadButton").attr("disabled", false);
        }else{
          $("#uploadButton").attr("disabled", true);
        }
    });

})();

function readablizeBytes(bytes) {
    var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
}

function secondsToStr(temp) {
    function numberEnding(number) {
        return (number > 1) ? 's' : '';
    }
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    return seconds + ' second' + numberEnding(seconds);
}
