/**
 * Created by ashish on 31/03/2014.
 */
/*jslint browser:true, indent:2, nomen:true*/
/*global $, MediaStreamTrack*/

(function () {
  'use strict';
  var getGetUserMedia = function () {
    return window.URL && window.URL.createObjectURL && (navigator.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);
  };

  var stopStream = function (stream){
    var tracks;

    if (!stream){
      return;
    }

    if (stream.stop) {
      stream.stop();
    } else if (stream.getTracks){
      tracks = stream.getTracks();
      tracks.length && tracks[0].stop();
    }
  };

  $.widget("blink.cameraDialog", $.ui.dialog, {
    open: function () {
      var $input = $('<figure class="input" style="text-align: center;">'),
        $output = $('<figure class="output" style="text-align: center;">'),
        $message = $('<dl class="error" style="display:none;">'),
        $canvas = $('<canvas style="display:none">'),
        getMedia = getGetUserMedia();

      if (!getMedia) {
        return this._super(); // nothing can be done
      }

      $input.append('<video autoplay width="100%">');
      $output.append('<img style="max-width: 100%; max-height: 100%" />');
      $message.append("<dt>").append("<dd>");

      //attach elements to dialog
      this.element.html('').append($input).append($output).append($canvas).append($message);

      this._setOption('buttons', this.button);
      this.getSources();
      $(window).on('resize', $.proxy(this.resize, this));
      this.resize();
      this.begin();

      // Invoke the parent widget's open().
      return this._super();
    },
    resize: function () {
      var minWindow = Math.min(window.innerHeight, window.innerWidth),
        dialogSize = minWindow;

      this._setOption('width', dialogSize);
      this._setOption('height', dialogSize);
      this._setOption('position', 'center');
      this._size();
    },
    end: function () {
      var $elem = this.element,
        $video = $elem.find('video'),
        $input = $elem.children('.input'),
        stream = $elem.data('stream'),
        mediaTrack,
        getMedia = getGetUserMedia();

      if (!getMedia) {
        return; // nothing can be done
      }

      if ($input) {
        $input.hide();
      }
      if ($video && $video[0]) {
        $video[0].pause();
        $video.removeAttr('src');
      }

      stopStream(stream);
      $elem.data('stream', null);
    },
    begin: function () {
      var $elem = this.element,
        self = this,
        getMedia = getGetUserMedia(),
        $input = $elem.children('.input'),
        $output = $elem.children('.output'),
        $img = $output.children('img'),
        $canvas = $elem.find('canvas'),
        $video = $elem.find('video'),
        $select = $elem.find('#camerasource'),
        options = {
          video: true,
          audio: false
        };

      if (!getMedia) {
        return; // nothing can be done
      }

      //reset stream > this is required to swap camera
      if ($elem.data('stream')) {
        $video.attr('src', null);
        stopStream($elem.data('stream'));
      }

      //fix camera selection
      if ($select.val()) {
        options.video = {
          'optional': [
            {sourceId: $select.val()}
          ]
        };
      }

      $input.show();
      $output.hide();
      $elem.find('dl.error').hide();

      $elem.parent('.ui-dialog').find('button:gt(1)')
        .button('disable');

      $video.one('click', function () {
        var video = $video[0],
          ctx = $canvas[0].getContext('2d'),
          width,
          height;

        if ($video.data('orientation') === 90 ||
            $video.data('orientation') === 270) {
          height = video.videoWidth;
          width = video.videoHeight;
        } else {
          height = video.videoHeight;
          width = video.videoWidth;
        }

        $canvas.attr('height', height);
        $canvas.attr('width', width);

        if ($video.data('orientation') === 90) {
          ctx.rotate($video.data('orientation') * Math.PI / 180);
          ctx.drawImage(video, 0, -video.videoHeight);
        } else if ($video.data('orientation') === 180) {
          ctx.rotate($video.data('orientation') * Math.PI / 180);
          ctx.drawImage(video, -video.videoWidth, -video.videoHeight);
        } else if ($video.data('orientation') === 270) {
          ctx.rotate($video.data('orientation') * Math.PI / 180);
          ctx.drawImage(video, -video.videoWidth, 0);
        } else {
          ctx.drawImage(video, 0, 0);
        }

        $img.attr('src', $canvas[0].toDataURL('image/jpeg'));
        $output.show();

        setTimeout(function () {
          self.end();
          $elem.parent('.ui-dialog').find('button:gt(1)')
            .button('enable');
        }, 197);
      });

      getMedia.call(navigator, options, function (localMediaStream) {
        $video.attr('src', window.URL.createObjectURL(localMediaStream));
        $elem.data('stream', localMediaStream);
      }, function (err) {
        var name, message, $dl = $elem.find('dl.error');
        name = err.name || err;
        message = self.options && self.options.errors && self.options.errors[name] ? self.options.errors[name] : '';
        $dl.find('dt').html(name);
        if (message !== '') {
          $dl.find('dd').html(message);
        }
        $dl.show();
        $input.hide();
        $output.hide();
      });
    },
    _setOption: function (key, value) {
      this._super(key, value);
      this._superApply(arguments);
    },
    getSources: function () {
      var self = this,
        buildList = function (sourceInfos) {
          var $select = $('<select id="camerasource">');
          var camCounter = 0;
          var i;
          var sourceInfo;
          var $option;
          for (i = 0; i !== sourceInfos.length; ++i) {
            sourceInfo = sourceInfos[i];
            $option = $('<option>');
            $option.prop('value', sourceInfo.id);
            if (sourceInfo.kind === 'video') {
              camCounter++;
              $option.text(sourceInfo.label || 'camera ' + camCounter);
              $select.append($option);
            }
          }
          if (camCounter > 1) {
            //hooking onChange() of select with camera loading
            $select.on('change', function () {
              self.end();
              setTimeout(function () {
                self.begin();
              }, 197);
            });
            //prepand select box before camera
            self.element.find('figure.input').prepend($select);
          }
        };

      if (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources === 'undefined') {
        try {
          /*eslint-disable no-console*/
          window.console.error('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
          /*eslint-enable no-console*/
        } catch (ignore) {}
      } else {
        MediaStreamTrack.getSources(buildList);
      }
    },
    close: function () {
      var getMedia = getGetUserMedia();
      if (!getMedia) {
        return; // nothing can be done
      }

      $(window).off('resize', this.resize);
      this.end();
      this.element.html('');

      this._super();
    },
    button: [
      {
        'text': 'rotate',
        click: function () {
          var $dialog = $(this), $video, orientation, rotateCSS;
          $video = $dialog.find('video');
          orientation = $video.data('orientation');
          if (orientation) {
            $video.data('orientation', (orientation + 90) % 360);
          } else {
            $video.data('orientation', 90);
          }
          rotateCSS = 'rotate(' + $video.data('orientation') + 'deg)';
          $video.css({
            '-webkit-transform': rotateCSS,
            'transform': rotateCSS
          });
        }
      },
      {
        'text': 'cancel',
        click: function () {
          var $dialog = $(this);
          $dialog.cameraDialog('close');
        }
      },
      {
        'text': 'recapture',
        click: function () {
          var $dialog = $(this);
          $dialog.data('cameraDialog').begin();
        }
      },
      {
        'text': 'use',
        click: function () {
          var $dialog = $(this),
            options = $dialog.data('cameraDialog').options,
            $img = $dialog.find('img');
          if (options && options.callback && options.callback.use) {
            options.callback.use($img.attr('src'));
          }
          $dialog.cameraDialog('close');
        }
      }
    ]
  });
}());
