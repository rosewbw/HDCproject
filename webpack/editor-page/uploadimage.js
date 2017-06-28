/**
 * Created by HDC on 2016/4/15.
 */

(function($) {

    var elmId = null;

    function Up(obj) {
        if(obj.btn === 'undefined' || obj.url === 'undefined') {
            return
        }
        this.btn = obj.btn;
        this.url = obj.url;
        this.files = {};
        this.inputId = obj.inputId;
        elmId = obj.elmId;
        setEvent(obj.inputId, this);
    }

    Up.prototype.start = function(progress, cancelEditor) {
        var files = [];
        for(var option in this.files) {
            files.push({
                file: this.files[option].fileSource,
                btnId: option
            });
        }
        if(files.length > 0) {
            upload(files, files.length -1, this.url, progress, cancelEditor);
        } else {
            cancelEditor();
            return false
        }
    };

    Up.prototype.destroy = function() {
        $('#'+this.inputId).unbind();
        this.btn = null;
    };

    function setEvent(inputId, self) {
        $('#'+inputId).bind({
            change: function() {
                if(self.btn && this.files[0]) {
                    self.files[self.btn.id] = {
                        fileSource: this.files[0],
                        localUrl: window.URL.createObjectURL(this.files[0])
                    };
                    $('#'+self.btn.id).css({
                        'background-image': 'url('+self.files[self.btn.id].localUrl+')',
                        'background-size': '100% 100%'
                    });
                    this.value = null;
                }
            }
        });
    }

    function upload(files, index, url, progress, cancelEditor) {
        var btnId = files[index].btnId.match(/[^\_]+/)[0];
        var formData = new FormData();
        formData.append('file', files[index].file);
        $.ajax({
            url: url+'&btnid='+btnId+'&elmid='+elmId,
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            //xhr: function() {
            //    var xhr = $.ajaxSettings.xhr();
            //    xhr.upload.addEventListener('progress', function (e) {
            //        progress(e, files[index].file.name);
            //    });
            //    return xhr;
            //},
            success: function(data) {
                if(data.success){
                    formData = null;
                    index > 0 ? upload(files, index-1, url, progress, cancelEditor) : cancelEditor();
                } else {
                    alert('upload failed');
                }
            },
            error: function(xhr,status,err) {
                console.log(err);
                alert(err);
            }
        });
    }

    window.upImg = Up;

})(jQuery);

if(typeof module !== 'undefined') {
    module.exports = window.upImg;
}
