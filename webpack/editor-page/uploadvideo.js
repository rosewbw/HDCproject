/**
 * Created by HDC on 2016/4/17.
 */

(function($) {

    var url = '#';
    var inputId = null;

    function UpVideo(obj, callback) {
        url = obj.url;
        inputId = obj.inputId;
        setEvent(obj.containerId, callback);
    }

    function setEvent(containerId, callback) {
        $('#'+inputId).bind({
            change: function() {
                var uploader = new Upload();
                uploader.file = this.files[0];
                uploader.uploading(containerId, callback);
                this.value = null;
            }
        });
    }

    function Upload() {
        this.bar = createBar();
        this.file = null;
    }

    Upload.prototype.uploading = function (containerId, callback) {
        var self = this;
        var formData = new FormData();
        self.bar.children('.video-upload-file-name').text(self.file.name);
        formData.append('file', self.file);
        $('#'+containerId).append(self.bar);
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.addEventListener('progress', function (e) {
                    this.bar.find('.video-upload-progress').css('width', this.bar.children('.video-upload-progress-bar').width()*(e.loaded/e.total));
                }.bind(this));
                return xhr;
            }.bind(self),
            success: function(data) {
                if(data.success){
                    formData = null;
                    callback ? callback(data) : '';
                } else {
                    alert('upload failed');
                }
                this.bar.remove();
                self = null;
            }.bind(self),
            error: function(xhr,status,err) {
                console.log(err);
                alert(err);
                this.bar.remove();
                self = null;
            }.bind(self)
        });
    };

    function createBar() {
        var container = create('div').addClass('video-upload-bar-container');
        var fileName = create('span').addClass('video-upload-file-name');
        var bar = create('div').addClass('video-upload-progress-bar');
        var progress = create('div').addClass('video-upload-progress');
        container.append(fileName, bar.append(progress));
        return container
    }

    function create(table) {
        var xmlns = 'http://www.w3.org/2000/svg';
        switch (table) {
            case 'p':
                return $('<p></p>');
            case 'img':
                return $('<img>');
            case 'div':
                return $('<div></div>');
            case 'span':
                return $('<span></span>');
            case 'input':
                return $('<input></input>');
            case 'svg':
                return $(document.createElementNS(xmlns, 'svg'));
            case 'path':
                return $(document.createElementNS(xmlns, 'path'));
            case 'rect':
                return $(document.createElementNS(xmlns, 'rect'));
            case 'svg-ori':
                return document.createElementNS(xmlns, 'svg');
            case 'path-ori':
                return document.createElementNS(xmlns, 'path');
            case 'rect-ori':
                return document.createElementNS(xmlns, 'rect');
        }
    }

    window.upVideo = UpVideo;

})(jQuery);

if(typeof module !== 'undefined') {
    module.exports = window.upVideo;
}