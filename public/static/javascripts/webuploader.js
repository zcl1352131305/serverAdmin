function initWebUploader(param){
    for (var i = 0; i<param.length; i++){
        createWebUploaderCus(param[i]);
    }
}

function createWebUploaderCus(param){
    var baseUrl = "http://127.0.0.1:8080";

        jQuery(function() {
            var $ = jQuery,    // just in case. Make sure it's not an other libaray.

                $wrap = $('#'+param.uploaderID),

                // 图片容器
                $queue = $('<ul class="filelist"></ul>')
                    .appendTo( $wrap.find('.queueList') ),

                // 状态栏，包括进度和控制按钮
                $statusBar = $wrap.find('.statusBar'),

                // 文件总体选择信息。
                $info = $statusBar.find('.info'),

                // 上传按钮
                $upload = $wrap.find('.uploadBtn'),

                // 没选择文件之前的内容。
                $placeHolder = $wrap.find('.placeholder'),

                // 总体进度条
                $progress = $statusBar.find('.progress').hide(),

                // 添加的文件数量
                fileCount = 0,

                // 添加的文件总大小
                fileSize = 0,

                // 优化retina, 在retina下这个值是2
                ratio = window.devicePixelRatio || 1,

                // 缩略图大小
                thumbnailWidth = 110 * ratio,
                thumbnailHeight = 110 * ratio,

                // 可能有pedding, ready, uploading, confirm, done.
                state = 'pedding',

                // 所有文件的进度信息，key为file id
                percentages = {},

                supportTransition = (function(){
                    var s = document.createElement('p').style,
                        r = 'transition' in s ||
                            'WebkitTransition' in s ||
                            'MozTransition' in s ||
                            'msTransition' in s ||
                            'OTransition' in s;
                    s = null;
                    return r;
                })(),

                // WebUploader实例
                uploader;

            if ( !WebUploader.Uploader.support() ) {
                alert( 'Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
                throw new Error( 'WebUploader does not support the browser you are using.' );
            }

            var fileNumLimit = 10;
            if(param.fileNumLimit != null ){
                fileNumLimit = param.fileNumLimit;
            }
            // 实例化
            uploader = WebUploader.create({
                pick: {
                    id: '#'+param.filePickerID,
                    label: '点击选择文件'
                },
                dnd: '#'+param.uploaderID+' .queueList',
                paste: document.body,

                /*accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/!*'
                },*/

                // swf文件路径
                swf: '/static/javascripts/plugins/webuploader/Uploader.swf',

                disableGlobalDnd: true,
                duplicate:true,
                chunked: true,
                // server: 'http://webuploader.duapp.com/server/fileupload.php',
                server: '/proxy/file/upload',
                fileNumLimit: fileNumLimit,
                fileSizeLimit: 5 * 1024 * 1024,    // 200 M
                fileSingleSizeLimit: 1 * 1024 * 1024    // 50 M
            });

            //初始化文件
            if(null != param.initFiles){
                if(param.initFiles.length > 0){
                    var files = [];
                    for(var i = 0; i<param.initFiles.length;i++){
                        addUploadedFile(param.initFiles[i]);
                    }
                    $placeHolder.addClass( 'element-invisible' );
                    $( '#'+param.filePicker2ID ).removeClass( 'element-invisible');
                    $statusBar.show();
                    fileCount++;
                }
            }

            function isPic(name) {
                //判断是否是图片 - strFilter必须是小写列举
                var strFilter=".jpeg|.gif|.jpg|.png|.bmp|.pic|"
                if(name.indexOf(".")>-1)
                {
                    var p = name.lastIndexOf(".");
                    var strPostfix=name.substring(p,name.length) + '|';
                    strPostfix = strPostfix.toLowerCase();
                    if(strFilter.indexOf(strPostfix)>-1)
                    {
                        return true;
                    }
                }
                return false;
            }




            function addUploadedFile(file){
                var file1 = {
                    fileName:file.fileName,
                    fileUrl:file.fileUrl,
                    idUpload:file.idUpload,
                    size:file.size
                }
                var inputStr = '<input type="hidden" id="input_'+file.id+'" name="'+param.inputName+'" value=\''+JSON.stringify(file1)+'\' />';
                $("#"+param.uploaderID).parent().append(inputStr);

                var imgSrc='<img src="'+baseUrl+file.fileUrl+'">';
                if(!isPic(file.fileName)){
                    imgSrc = "不能预览";
                }else{
                    imgSrc='<img src="'+baseUrl+file.fileUrl+'">';
                }

                var $li = $( '<li id="' + file.id + '">' +
                        '<p class="title">' + file.fileName + '</p>' +
                        '<p class="imgWrap">'+imgSrc+'</p>'+
                        '<p class="progress"><span></span></p>' +
                        '<span class="success"></span>' +
                        '</li>' ),

                    $btns = $('<div class="file-panel">' +
                        '<span class="cancel">删除</span>' +
                        '</div>').appendTo( $li ),
                    $wrap = $li.find( 'p.imgWrap' );
                ;


                $li.on( 'mouseenter', function() {
                    $btns.stop().animate({height: 30});
                });

                $li.on( 'mouseleave', function() {
                    $btns.stop().animate({height: 0});
                });

                $btns.on( 'click', 'span', function() {
                    var index = $(this).index(),
                        deg;

                    switch ( index ) {
                        case 0:
                            $li.off().find('.file-panel').off().end().remove();
                            $("#input_"+file.id).remove();
                            fileCount --;

                            if(!fileCount){
                                $placeHolder.removeClass( 'element-invisible' );
                                //$queue.parent().removeClass('filled');
                                $statusBar.addClass( 'element-invisible' );
                                uploader.refresh();
                            }

                            return;
                    }

                    if ( supportTransition ) {
                        deg = 'rotate(' + file.rotation + 'deg)';
                        $wrap.css({
                            '-webkit-transform': deg,
                            '-mos-transform': deg,
                            '-o-transform': deg,
                            'transform': deg
                        });
                    } else {
                        $wrap.css( 'filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+ (~~((file.rotation/90)%4 + 4)%4) +')');
                    }


                });

                $li.appendTo( $queue );
            }

            // 添加“添加文件”的按钮，
            uploader.addButton({
                id: '#'+param.filePicker2ID,
                label: '继续添加'
            });

            // 当有文件添加进来时执行，负责view的创建
            function addFile( file ) {
                var $li = $( '<li id="' + file.id + '">' +
                        '<p class="title">' + file.name + '</p>' +
                        '<p class="imgWrap"></p>'+
                        '<p class="progress"><span></span></p>' +
                        '</li>' ),

                    $btns = $('<div class="file-panel">' +
                        '<span class="cancel">删除</span>' +
                        '</div>').appendTo( $li ),
                    $prgress = $li.find('p.progress span'),
                    $wrap = $li.find( 'p.imgWrap' ),
                    $info = $('<p class="error"></p>'),

                    showError = function( code ) {
                        switch( code ) {
                            case 'exceed_size':
                                text = '文件大小超出';
                                break;

                            case 'interrupt':
                                text = '上传暂停';
                                break;

                            default:
                                text = '上传失败，请重试';
                                break;
                        }

                        $info.text( text ).appendTo( $li );
                    };

                if ( file.getStatus() === 'invalid' ) {
                    showError( file.statusText );
                } else {
                    // @todo lazyload
                    $wrap.text( '预览中' );
                    uploader.makeThumb( file, function( error, src ) {
                        if ( error ) {
                            $wrap.text( '不能预览' );
                            return;
                        }

                        var img = $('<img src="'+src+'">');
                        $wrap.empty().append( img );
                    }, thumbnailWidth, thumbnailHeight );

                    percentages[ file.id ] = [ file.size, 0 ];
                    file.rotation = 0;
                }

                file.on('statuschange', function( cur, prev ) {
                    if ( prev === 'progress' ) {
                        $prgress.hide().width(0);
                    } else if ( prev === 'queued' ) {
                        $li.off( 'mouseenter mouseleave' );
                        $btns.remove();
                    }

                    // 成功
                    if ( cur === 'error' || cur === 'invalid' ) {
                        console.log( file.statusText );
                        showError( file.statusText );
                        percentages[ file.id ][ 1 ] = 1;
                    } else if ( cur === 'interrupt' ) {
                        showError( 'interrupt' );
                    } else if ( cur === 'queued' ) {
                        percentages[ file.id ][ 1 ] = 0;
                    } else if ( cur === 'progress' ) {
                        $info.remove();
                        $prgress.css('display', 'block');
                    } else if ( cur === 'complete' ) {
                        $li.append( '<span class="success"></span>' );
                    }

                    $li.removeClass( 'state-' + prev ).addClass( 'state-' + cur );
                });

                $li.on( 'mouseenter', function() {
                    $btns.stop().animate({height: 30});
                });

                $li.on( 'mouseleave', function() {
                    $btns.stop().animate({height: 0});
                });

                $btns.on( 'click', 'span', function() {
                    var index = $(this).index(),
                        deg;

                    switch ( index ) {
                        case 0:
                            uploader.removeFile( file );
                            return;
                    }

                    if ( supportTransition ) {
                        deg = 'rotate(' + file.rotation + 'deg)';
                        $wrap.css({
                            '-webkit-transform': deg,
                            '-mos-transform': deg,
                            '-o-transform': deg,
                            'transform': deg
                        });
                    } else {
                        $wrap.css( 'filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+ (~~((file.rotation/90)%4 + 4)%4) +')');
                        // use jquery animate to rotation
                        // $({
                        //     rotation: rotation
                        // }).animate({
                        //     rotation: file.rotation
                        // }, {
                        //     easing: 'linear',
                        //     step: function( now ) {
                        //         now = now * Math.PI / 180;

                        //         var cos = Math.cos( now ),
                        //             sin = Math.sin( now );

                        //         $wrap.css( 'filter', "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos + ",M12=" + (-sin) + ",M21=" + sin + ",M22=" + cos + ",SizingMethod='auto expand')");
                        //     }
                        // });
                    }


                });

                $li.appendTo( $queue );
            }

            // 负责view的销毁
            function removeFile( file ) {
                var $li = $('#'+file.id);

                delete percentages[ file.id ];
                updateTotalProgress();
                $li.off().find('.file-panel').off().end().remove();
            }

            function updateTotalProgress() {
                var loaded = 0,
                    total = 0,
                    spans = $progress.children(),
                    percent;

                $.each( percentages, function( k, v ) {
                    total += v[ 0 ];
                    loaded += v[ 0 ] * v[ 1 ];
                } );

                percent = total ? loaded / total : 0;

                spans.eq( 0 ).text( Math.round( percent * 100 ) + '%' );
                spans.eq( 1 ).css( 'width', Math.round( percent * 100 ) + '%' );
                updateStatus();
            }

            function updateStatus() {
                /*var text = '', stats;

                if ( state === 'ready' ) {
                    text = '选中' + fileCount + '张图片，共' +
                        WebUploader.formatSize( fileSize ) + '。';
                } else if ( state === 'confirm' ) {
                    stats = uploader.getStats();
                    if ( stats.uploadFailNum ) {
                        text = '已成功上传' + stats.successNum+ '张照片至XX相册，'+
                            stats.uploadFailNum + '张照片上传失败，<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>'
                    }

                } else {
                    stats = uploader.getStats();
                    text = '共' + fileCount + '张（' +
                        WebUploader.formatSize( fileSize )  +
                        '），已上传' + (stats.successNum+1) + '张';

                    if ( stats.uploadFailNum ) {
                        text += '，失败' + stats.uploadFailNum + '张';
                    }
                }

                $info.html( text );*/
            }

            function setState( val ) {
                var file, stats;

                if ( val === state ) {
                    return;
                }

                $upload.removeClass( 'state-' + state );
                $upload.addClass( 'state-' + val );
                state = val;

                switch ( state ) {
                    case 'pedding':
                        $placeHolder.removeClass( 'element-invisible' );
                        $queue.parent().removeClass('filled');
                        $queue.hide();
                        $statusBar.addClass( 'element-invisible' );
                        uploader.refresh();
                        break;

                    case 'ready':
                        $placeHolder.addClass( 'element-invisible' );
                        $( '#'+param.filePicker2ID ).removeClass( 'element-invisible');
                        $queue.parent().addClass('filled');
                        $queue.show();
                        $statusBar.removeClass('element-invisible');
                        uploader.refresh();
                        break;

                    case 'uploading':
                        $( '#'+param.filePicker2ID ).addClass( 'element-invisible' );
                        $progress.show();
                        $upload.text( '暂停上传' );
                        break;

                    case 'paused':
                        $progress.show();
                        $upload.text( '继续上传' );
                        break;

                    case 'confirm':
                        $progress.hide();
                        $upload.text( '开始上传' );
                        $( '#'+param.filePicker2ID ).removeClass( 'element-invisible');
                        stats = uploader.getStats();
                        if ( stats.successNum && !stats.uploadFailNum ) {
                            //setState( 'finish' );
                            return;
                        }
                        break;
                    case 'finish':
                        stats = uploader.getStats();
                        if ( stats.successNum ) {
                            alert( '上传成功' );
                        } else {
                            // 没有成功的图片，重设
                            state = 'done';
                            location.reload();
                        }
                        break;
                }

                updateStatus();
            }

            uploader.onUploadProgress = function( file, percentage ) {
                var $li = $('#'+file.id),
                    $percent = $li.find('.progress span');

                $percent.css( 'width', percentage * 100 + '%' );
                percentages[ file.id ][ 1 ] = percentage;
                updateTotalProgress();
            };

            uploader.onFileQueued = function( file ) {
                fileCount++;
                fileSize += file.size;

                if ( fileCount === 1 ) {
                    $placeHolder.addClass( 'element-invisible' );
                    $statusBar.show();
                }

                addFile( file );
                setState( 'ready' );
                updateTotalProgress();
            };

            uploader.onFileDequeued = function( file ) {
                fileCount--;
                fileSize -= file.size;

                if ( !fileCount ) {
                    setState( 'pedding' );
                }

                removeFile( file );
                updateTotalProgress();

            };

            uploader.onUploadSuccess = function(file,obj){
                delete obj._raw;
                obj.size = file.size;
                //obj.idUpload = file.id;
                var inputStr = '<input type="hidden" id="input_'+file.id+'" name="'+param.inputName+'" value=\''+JSON.stringify(obj)+'\' />';
                $("#"+param.uploaderID).parent().append(inputStr);

                var $li = $("#"+file.id);
                var $btns = $('<div class="file-panel">' +
                    '<span class="cancel">删除</span>' +
                    '</div>').appendTo($li);

                $li.on( 'mouseenter', function() {
                    $btns.stop().animate({height: 30});
                });

                $li.on( 'mouseleave', function() {
                    $btns.stop().animate({height: 0});
                });

                $btns.on( 'click', 'span', function() {
                    var index = $(this).index(),
                        deg;

                    switch ( index ) {
                        case 0:
                            $("#input_"+file.id).remove();
                            fileCount--;
                            fileSize -= file.size;

                            if ( !fileCount ) {
                                setState( 'pedding' );
                            }

                            removeFile( file );
                            updateTotalProgress();
                            return;
                    }
                });
            }

            uploader.on( 'all', function( type ) {
                var stats;
                switch( type ) {
                    case 'uploadFinished':
                        setState( 'confirm' );
                        break;

                    case 'startUpload':
                        setState( 'uploading' );
                        break;

                    case 'stopUpload':
                        setState( 'paused' );
                        break;

                }
            });

            uploader.onError = function( code ) {
                alert( 'Eroor: ' + code );
            };

            $upload.on('click', function() {
                if ( $(this).hasClass( 'disabled' ) ) {
                    return false;
                }

                if ( state === 'ready' ) {
                    uploader.upload();
                } else if ( state === 'paused' ) {
                    uploader.upload();
                } else if ( state === 'uploading' ) {
                    uploader.stop();
                }
            });

            $info.on( 'click', '.retry', function() {
                uploader.retry();
            } );

            $info.on( 'click', '.ignore', function() {
                alert( 'todo' );
            } );

            $upload.addClass( 'state-' + state );
            updateTotalProgress();
        });

}

