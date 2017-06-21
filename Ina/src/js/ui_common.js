(function(window, document, jQuery) {
	'use strict';
	var $ = jQuery,
		$window = $(window),
		$document = $(document),
		$body = $('body'),
		$gWrap;
	var shopUi = {},
		shopUtil = {};


	/*
	 * util function
	 */
	 /* window scroll disable & enable */
	shopUtil.windowScrollbar = {
		scrollbarWidth: 0,
		scrollTop: 0,
		disableClass: 'is-disable_scroll',
		disable: function(){
			var windowWidth = $window.width();

			this.scrollTop = $window.scrollTop();
			$body.addClass(this.disableClass);
			this.scrollbarWidth = $window.width() - windowWidth;
			this.resizeWrap();

			$window.on( 'resize.windowScrollbar', $.proxy(this, 'resizeWrap'));
		},
		enable: function(){
			$body.removeClass(this.disableClass);
			$gWrap.css({
				'width': ''
			});
			$window
				.off('resize.windowScrollbar')
				.scrollTop(this.scrollTop);
		},
		resizeWrap: function(){
			$gWrap.css({
				'width': $window.width() - this.scrollbarWidth
			});
		}
	};
	shopUtil.keyCheck = function(e){
		var keyCode = e.keyCode || e.which,
			keyName = {
				18: 'ALT',
				8: 'BACKSPACE',
				20: 'CAPS_LOCK',
				188: 'COMMA',
				91: 'OS',
				17: 'CONTROL',
				46: 'DELETE',
				40: 'DOWN',
				35: 'END',
				13: 'ENTER',
				27: 'ESCAPE',
				36: 'HOME',
				45: 'INSERT',
				37: 'LEFT',
				93: 'MENU', // COMMAND_RIGH
				107: 'NUMPAD_ADD',
				110: 'NUMPAD_DECIMAL',
				111: 'NUMPAD_DIVIDE',
				108: 'NUMPAD_ENTER',
				106: 'NUMPAD_MULTIPLY',
				109: 'NUMPAD_SUBTRACT',
				34: 'PAGE_DOWN',
				33: 'PAGE_UP',
				190: 'PERIOD',
				39: 'RIGHT',
				16: 'SHIFT',
				32: 'SPACE',
				9: 'TAB',
				38: 'UP'
		}
		return keyName[keyCode];
	}
	/* css check */
	shopUtil.cssProperty = function(prop) {
		var b = document.body || document.documentElement,
			s = b.style,
			p = prop;

		if (typeof s[p] === 'string') { return prop; }

		// Tests for vendor specific prop
		var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
		p = p.charAt(0).toUpperCase() + p.substr(1);

		for (var i=0; i<v.length; i++) {
			if (typeof s[v[i] + p] === 'string') { return v[i] + p; }
		}

		return false;
	}


	shopUi.bodyEscape = function(){
		$body.on('keydown', function(e){
			if( shopUtil.keyCheck(e) === 'ESCAPE' ){
				$body.trigger('escape');
			}
		});
	};
		

	/*
	 * shop ui effect
	 */
	/* basic gallery */
	shopUi.mainGallery = {
		init: function(){
			var _this = this;
			var $target = $('#mainGallery'),
				basicGallery = $target,
				nextBtnSelector = '.swiper-btn--next',
				prevBtnSelector = '.swiper-btn--prev',
				pagingWrapSelector = '.swiper-pagination',
				pagingBtnClass = 'swiper-btn-page';
			var pagingTemplete = '<a href="#" class="{{class}}">{{index}}</span>',
				mainSwiper = null;

			if( $target.length <= 0 ){
				return false;
			}

			if( $target.find('.swiper-slide').length <= 1 ){
				$target.find('.swiper-pagination, .swiper-btn--prev, .swiper-btn--next').hide();
			}
			
			mainSwiper = new Swiper($target, {
				effect: 'fade',
				autoHeight: true,
				initialSlide: 0,
				slidesPerView: 1,
				centeredSlides: true,
				loop: false,
				speed: 850,
				autoplay: 5000,
				nextButton: nextBtnSelector,
				prevButton: prevBtnSelector,
				paginationClickable: true,
				pagination: pagingWrapSelector,
				paginationBulletRender: function (swiper, index, className) {
					return pagingTemplete
						.replace( /{{class}}/g, pagingBtnClass + ' ' + className )
						.replace( /{{index}}/g, index );
				},
				onSlideChangeStart: function(swiper){
					var $items = $(swiper.wrapper).find('.swiper-slide'),
						$prevItem = $items.eq(swiper.previousIndex),
						$nowItem = $items.eq(swiper.activeIndex),
						$prevPlayerWrap = $prevItem.find('.main_swiper_youtube'),
						$nowPlayerWrap = $nowItem.find('.main_swiper_youtube'),
						$prevPlayerFrame = $prevItem.find('.js_youtube_player'),
						$nowPlayerFrame = $nowItem.find('.js_youtube_player'),
						playerData;

					if( $prevPlayerWrap.length > 0 ){
						setTimeout(function(){
							mainSwiper.startAutoplay();
							$prevItem.off('onYoutubeReady.init');
							$prevItem.off('onYoutubeReady.naviSwipe');

							if( $prevPlayerFrame.data('ytPlayer') ){
								$prevPlayerFrame.data('ytPlayer').pauseVideo();
							}else{
								$prevItem
									.one('onYoutubePlay.temp', '.js_youtube_player',function(){
										$(this).data('ytPlayer').pauseVideo();
									});
							}
						},1000);
					}
					if( $nowPlayerWrap.length > 0 ){
						setTimeout(function(){
							mainSwiper.stopAutoplay();
							if( $nowPlayerFrame.data('ytPlayer') ){
								$nowItem.off('onYoutubePlay.temp');
								$nowPlayerFrame.data('ytPlayer').playVideo();
							}else{
								$nowItem.one('onYoutubeReady.naviSwipe', '.js_youtube_player', function(){
									$(this).data('ytPlayer').playVideo();
								});
							}
						},1000);
					}
				},
				onInit: function(swiper){
					var $activeItem = $(swiper.wrapper).find('.swiper-slide').eq(swiper.activeIndex),
						$activeVideoWrap = $activeItem.find('.main_swiper_youtube');

					if( $activeVideoWrap.length > 0 ){
						swiper.stopAutoplay();
						$activeItem.one('onYoutubeReady.init', '.js_youtube_player', function(){
							$(this).data('ytPlayer').playVideo();
						});
					}
				}
			});

			$target
				.on('onYoutubePlay', '.js_youtube_player', function(){
					mainSwiper.stopAutoplay();
				})
				.on('onYoutubeStop', '.js_youtube_player', function(){
					mainSwiper.slideNext();
					mainSwiper.startAutoplay();
				})
				.on('onYoutubePaused', '.js_youtube_player', function(){
					mainSwiper.startAutoplay();
				});
		}

	};

	shopUi.createYoutubePlayer = {
		selector: '[data-youtube-url]',
		init: function(){
			var tag = document.createElement('script'),
				videoItems = $(this.selector),
				firstScriptTag;
			if( videoItems.length > 0 ){
				tag.src = 'https://www.youtube.com/iframe_api';
				firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}
			window.onYouTubeIframeAPIReady = this.apiReady;
		},
		apiReady: function(){
			var _this = shopUi.createYoutubePlayer,
				videoItems = $(_this.selector);

			videoItems.each(function(i,el){
				var videoUrl = $(el).data('youtubeUrl'),
					videoCode,
					player;

				videoCode = videoUrl.replace(/(.*youtube\.com\/|.*youtu\.be\/)|(embed\/)|(watch\?v\=)|(\?.*)|(\".*)|(\'.*)/g,'');

				player = new YT.Player(el, {
					videoId: videoCode,
					playerVars: {
						autoplay: '0',
						loop: '0'
					},
					events: {
						'onStateChange': _this.stateChange,
						'onReady': _this.stateReady
					}
				});
				$(player.a).data('ytPlayer', player);
			});
		},
		stateReady: function(e){
			var $playerFrame = $(e.target.a)
			$playerFrame
				.addClass('js_youtube_player')
				.trigger('onYoutubeReady');
		},
		stateChange: function(e){
			var $iframe = $(e.target.a);
			
			if (e.data === YT.PlayerState.PLAYING) {
				$iframe.trigger('onYoutubePlay');
			}else if (e.data === YT.PlayerState.PAUSED) {
				$iframe.trigger('onYoutubePaused');
			}else if (e.data === YT.PlayerState.ENDED) {
				e.target.stopVideo();
				$iframe.trigger('onYoutubeStop');
			}
		}
	};

	/* dimmed show */
	shopUi.dimmed = {
		templete: '<div class="wrap_dimmed" id="wrapDimmed"></div>',
		duration: 500,
		show: function(duration){
			var $dimmed = $('#wrapDimmed'),
				runTime = 0;

			if( $dimmed.length <= 0 ){
				$body.append(this.templete);
				$dimmed = $('#wrapDimmed');
			}
			if( duration ){
				runTime = duration;
			}else{
				runTime = this.duration;
			}

			$dimmed.stop().fadeIn(runTime);
		},
		hide: function(duration){
			var $dimmed = $('#wrapDimmed'),
				runTime = 0;

			if( $dimmed.length <= 0 ) return false;

			if( duration ){
				runTime = duration;
			}else{
				runTime = this.duration;
			}
			
			$dimmed.stop().fadeOut(runTime);
		}
	};

	/* side cart show */
	shopUi.sideCart = {
		obj: null,
		runTime: 500,
		init: function(){
			var _this =  this;

			this.obj = $('#sideCart');

			if( this.obj.length <= 0 ) return false;

			$body
				.on('click', '.js_side_cart_toggle', function(e){
					e.preventDefault();
					$body.trigger('cartToggle');
				})
				.on('cartShow', $.proxy(this, 'show'))
				.on('cartHide', $.proxy(this, 'hide'))
				.on('cartToggle', $.proxy(this, 'toggle'));
		},
		show: function(){
			var _this = this,
				useTransform = shopUtil.cssProperty('transform');
			
			shopUtil.windowScrollbar.disable();
			this.obj.addClass('is-active');

			$body
				.on('click.sideCart touchend.sideCart', $.proxy(this, 'sideClose'))
				.on('escape.sideCart', function(e){
					_this.sideClose(e);
				});

			if( useTransform ){
				this.obj.stop().animate({ borderSpacing: -300 }, {
					step: function(now,fx) {
						$(this).css(useTransform, 'translateX( '+now+'px )');
					},
					duration: this.runTime
				});
			}else{
				this.obj.stop().animate({ 'right': '300px' }, this.runTime);
			}
			shopUi.dimmed.show(this.runTime);
		},
		hide: function(){
			var _this = this,
				useTransform = shopUtil.cssProperty('transform');
			var completeFunc = function(){
				$body.off('click.sideCart');
				shopUtil.windowScrollbar.enable();
				_this.obj.removeClass('is-active');
			};

			$body.off('escape.sideCart');
			
			if( useTransform ){
				this.obj.stop().animate({ borderSpacing: 300 }, {
					step: function(now,fx) {
						$(this).css(useTransform, 'translateX('+ (now - 300) +'px)');
					},
					duration: _this.runTime,
					complete: function(){ completeFunc() }
				});
			}else{
				this.obj.stop().animate({ 'right': '0' }, this.runTime);
			}
			shopUi.dimmed.hide(this.runTime);
		},
		toggle: function(){
			if( this.obj.hasClass('is-active') ){
				$body.trigger('cartHide');
			}else{
				$body.trigger('cartShow');
			}
		},
		sideClose: function(e){
			var $target = $(e.target);
			if( $target.closest('#sideCart').length <= 0 ){
				$body.trigger('cartHide');
			}
		}
	};
	/* toggle slide */
	shopUi.toggleSlide = {
		btnDataName: 'data-toggle-slide',
		contentDataName: 'data-toggle-content',
		duration: 400,
		init: function(){
			var _this = this;

			this.stateUpdate();
			$body
				.on('toggle', '['+this.btnDataName+']', function(e){
					e.preventDefault();
					_this.toggle($(this));
				})
				.on('click', '['+this.btnDataName+']', function(e){
					e.preventDefault();
					$(this).trigger('toggle');
				});
		},
		stateUpdate: function(){
			var _this = this,
				targetSelector = '['+this.btnDataName+']',
				$target = $(targetSelector);
			
			$target.each(function(index, el) {
				var $obj = $(el);
				var data = $(this).attr(_this.btnDataName),
					$content = $( '['+_this.contentDataName+'='+data+']');

				if( $obj.hasClass('is-active') ){
					$content.show();
				}else{
					$content.hide();
				}
			});
		},
		toggle: function($obj){
			var value = $obj.attr(this.btnDataName),
				$content = $('['+this.contentDataName+'='+value+']');

			if( $obj.hasClass('is-active') ){
				$content.stop().slideUp(this.duration);
				$obj.removeClass('is-active');
			}else{
				$content.stop().slideDown(this.duration);
				$obj.addClass('is-active');
			}
		}
	};
	shopUi.optionSlider = {
		value: {},
		moveBtn: null,
		moveType: null,
		clickPos: 0,
		trackWidth: null,
		inner: null,
		btnStart: null,
		btnEnd: null,
		startValue: 0,
		endValue: 0,
		init: function(){
			var option,
				_this = this;

			$body
				.on('mousedown.optionSlider', '[data-slider-btn]', function(e){
					_this.start( $(this), e );
				})
				.on('change.optionSlider', '[data-slider]', function(e){
					_this.change( $(this) );
				});

			this.resetAll();
		},
		resetAll: function(){
			var _this = this;
			$.each($('[data-slider]'), function(index, el) {
				var $el = $(el),
					trackWidth = $el.find('.track').width(),
					$btnStart = $el.find('[data-slider-btn=start]'),
					$btnEnd = $el.find('[data-slider-btn=end]'),
					rangeData = JSON.parse( $el.data('slider').replace(/[']/g,'"') ),
					defaultData = $el.data('sliderDefault');
				var	ex = 0,
					start = 0,
					end = 0,
					data;
				if( rangeData.start <= 0 && rangeData.end <= 0){
					$btnStart.css('left', 0 );
					$btnEnd.css('left', '100%' );
					$el.css('opacity', 0.5)
						.find('.track_inner').hide();
					$el.on('mousedown', function(){ return false; });
				}else{
					if( defaultData ){
						data = JSON.parse( defaultData.replace(/[']/g,'"') );
						ex = rangeData.end - rangeData.start ;
						start = ((data.start - rangeData.start ) / ex) * 100;
						end = ((data.end - rangeData.start ) / ex) * 100;
					}else{
						start = 0;
						end = 100;
					}
					$btnStart
						.css('left', start + '%' )
						.data('sliderValue', start);
					$btnEnd
						.css('left', end + '%' )
						.data('sliderValue', end);

					_this.updateInner( $el );
				}

			});
		},
		start: function( $obj, e ){
			var _this = this,
				x = ( e.pageX ) ? e.pageX : e.clientX,
				data;

			e.preventDefault();

			this.wrap = $obj.closest('[data-slider]');
			this.moveBtn = $obj;
			this.moveBtn.addClass('is-active');
			this.clickPos = x - $obj.offset().left;
			this.trackWidth = this.wrap.find('.track').width();
			this.moveType = $obj.data('sliderBtn');
			this.btnStart = this.wrap.find('[data-slider-btn=start]');
			this.btnEnd = this.wrap.find('[data-slider-btn=end]');

			data = this.wrap.data('slider').replace(/[']/g,'"');
			this.value = JSON.parse(data);

			if( $obj.siblings('.track_inner').length > 0 ){
				this.inner = $obj.siblings('.track_inner')
			}

			$body
				.on('mousemove.optionSlider', function(e){
					_this.move( e );	
				})
				.on('mouseup.optionSlider', function(e){
					_this.end( e );
				})
				.on('mouseleave.optionSlider', function(e){
					_this.end( e );
				});

			$obj
				.css('z-index',6)
				.siblings('.btn').css('z-index',5);
				
		},
		move: function( e ){
			var x = ( e.pageX ) ? e.pageX : e.clientX;
			var targetX,
				targetLeft,
				type,
				max = 100,
				min = 0;

			if( !this.moveBtn ) return false;
			e.preventDefault();

			targetX = x - this.wrap.offset().left - this.clickPos;
			targetLeft = targetX / this.trackWidth * 100;

			if( this.moveType === 'start' ){
				max = this.btnEnd.data('sliderValue');
			}else if( this.moveType === 'end' ){
				min = this.btnStart.data('sliderValue');
			}
			
			if( targetLeft <= min ){
				targetLeft = min;
			}else if( targetLeft >= max ){
				targetLeft = max;
			}

			this.moveBtn
				.data('sliderValue', targetLeft);
			this.btnUpdate( this.wrap );
			this.wrap.trigger('change');
		},
		end: function( e ){
			if( this.moveBtn ){
				e.preventDefault();
				this.moveBtn.removeClass('is-active');
				this.moveBtn = null;
				$body
					.off('mousemove.optionSlider')
					.off('mouseup.optionSlider')
					.off('mouseleave.optionSlider');
			}
		},
		btnUpdate: function( $obj ){
			var $startBtn = $obj.find('[data-slider-btn=start]'),
				$endBtn = $obj.find('[data-slider-btn=end]');

			if( $startBtn.length > 0 ){
				$startBtn.css('left', $startBtn.data('sliderValue') + '%');
			}
			if( $endBtn.length > 0 ){
				$endBtn.css('left', $endBtn.data('sliderValue') + '%');
			}
			this.updateInner( $obj );
		},
		updateInner: function( $obj ){
			var $inner = $obj.find('.track_inner'),
				$btnStart = $obj.find('[data-slider-btn=start]'),
				$btnEnd = $obj.find('[data-slider-btn=end]');

			if( $inner.length > 0 ){
				$inner.css({
					left: $btnStart.data('sliderValue') + '%',
					width: ($btnEnd.data('sliderValue') - $btnStart.data('sliderValue')) + '%'
				});
			}
		},
		returnValue: function( value ){
			var endValue = this.value.end - this.value.start,
				result = ( endValue / 100 * value ) + this.value.start;
			return result.toFixed(2);
		},
		change: function( $obj ){
			var startBtn = $obj.find('[data-slider-btn=start]'),
				endBtn = $obj.find('[data-slider-btn=end]');

			$obj.data('sliderNow', {
				start: this.returnValue( startBtn.data('sliderValue') ),
				end: this.returnValue( endBtn.data('sliderValue') )
			});
		}

	};

	shopUi.priceSlider = function(){
		var $target = $('#price_option_slider'),
			$value = $target.find('.js_price_value'),
			$start = $value.find('.js_start'),
			$end = $value.find('.js_end'),
			defaultData = $target.data('sliderDefault');

		if( $target.length <= 0 ) return false;

		$target
			.on('change', function(){
				var value = $(this).data('sliderNow');
				if( value ){
					if( value.start ){
						$start.html( value.start );
					}
					if( value.end ){
						$end.html( value.end );
					}
				}
			});
		if( defaultData ){
			defaultData = JSON.parse( defaultData.replace(/[']/g,'"') );
		}else{
			defaultData = JSON.parse( $target.data('slider').replace(/[']/g,'"') );
		}

		if( defaultData.start ){
			$start.html( defaultData.start );
		}
		if( defaultData.end ){
			$end.html( defaultData.end );
		}
	};

	/*
	 * product list type toggle
	 */
	shopUi.pdtListToggle = {
		init: function(){
			var _this = this;
			$body.on('click', '[data-list-type-toggle]', function(e){
				_this.changeType($(this));
				return false;
			});
		},
		changeType: function($obj){
			var $list = $('[data-list-type]'),
				thisType = $obj.data('listTypeToggle');

			if( $list.length <= 0 ) return false;
			if( $list.attr('data-list-type') !== thisType ){
				$list.attr('data-list-type', thisType);
				$('[data-list-type-toggle]').removeClass('is-active');
				$obj.addClass('is-active');
			}
		}

	};
	/*
	 * product image view
	 */
	shopUi.pdtMagnifier = {
		magnifierScope: '<div class="magnifier_scope" style="left:-100%;top:-100%;"></div>',
		magnifierImage: '<div class="magnifier_image"></div>',
		noImage: '<span class="common_noimg"><span class="spr_common">NO IMAGE</span></span>',
		nowWrap: null,
		wrapOffset: null,
		nowLoading: false,
		nowAdded: false,
		imageLoader: null,
		handle: {
			obj: null,
			w: 0,
			h: 0
		},
		scope: {
			obj: null,
			img: null,
			w: 0,
			h: 0
		},
		limit:{
			x: 0,
			y: 0
		},
		image: {
			w: 0,
			h: 0
		},
		init: function(){
			$('body')
				.on('mouseenter', '.js_magnifier', $.proxy(this, 'create'))
				.on('mouseleave', '.js_magnifier', $.proxy(this, 'remove'))
				.on('mousemove', '.js_magnifier', $.proxy(this, 'handleMove'))
				.on('click', '.js_magnifier', function(e){
					e.preventDefault();
				});
		},
		create: function(e){
			var _this = this,
				imageUrl,
				listener;

			if( this.nowLoading ) return false;

			this.nowWrap = $(e.currentTarget);
			this.wrapOffset = this.nowWrap.offset();
			imageUrl = this.nowWrap.attr('href');
			this.handle.obj = $(this.magnifierScope);
			this.scope.obj = $(this.magnifierImage);

			if( imageUrl === '#' || imageUrl === '' ){
				this.handle.obj = null;
				return false;
			}

			this.nowLoading = true;
			this.imageLoader = new Image;
			if( addEventListener ){
				this.imageLoader.addEventListener('load', this.imageLoaded);
				this.imageLoader.addEventListener('error', this.imageLoadErr);
			}else{
				this.imageLoader.attachEvent('load', this.imageLoaded);
				this.imageLoader.attachEvent('error', this.imageLoadErr);
			}
			this.imageLoader.src = imageUrl;

		},
		imageLoaded: function(){
			var _this = shopUi.pdtMagnifier;
			_this.createComplete(this);
		},
		imageLoadErr: function(){
			var _this = shopUi.pdtMagnifier;
			_this.createFail(this);
		},
		wrapSetting: function(){
			this.nowWrap.prepend(this.handle.obj);
			this.scope.obj.css({
				'left': this.wrapOffset.left + this.nowWrap.width() - 1,
				'top': this.wrapOffset.top + 1,
				'width': this.nowWrap.width() - 2,
				'height': this.nowWrap.height() - 2
			});
			this.scope.w = this.scope.obj.width();
			this.scope.h = this.scope.obj.height();
			this.handle.w = this.handle.obj.outerWidth();
			this.handle.h = this.handle.obj.outerHeight();
			this.limit.x = this.nowWrap.width() - this.handle.w;
			this.limit.y = this.nowWrap.height() - this.handle.h;
		},
		createComplete: function(img){
			this.wrapSetting();
			$body.prepend(this.scope.obj);

			this.scope.img = $(img);
			this.scope.img.addClass('magnifier_img');
			this.scope.obj.append(this.scope.img);

			if( this.scope.img.width() < (this.scope.w * 1.5) ){
				this.scope.img.width( this.scope.w * 1.5 );
			}

			this.image.w = this.scope.img.width();
			this.image.h = this.scope.img.width();
			this.nowLoading = false;
			this.nowAdded = true;
		},
		createFail: function(e){
			this.nowLoading = false;
			this.nowAdded = true;
			this.scope.obj.append(this.noImage);
		},
		remove: function(e){
			if( this.handle.obj ){
				this.handle.obj.remove();
			}
			if( this.scope.obj ){
				this.scope.obj.remove();
			}
			this.handle.obj = null;
			this.scope.obj = null;
			this.scope.img = null;
			this.nowWrap = null;
			this.nowAdded = false;
			if( this.imageLoader ){
				if( addEventListener ){
					this.imageLoader.removeEventListener('load', this.imageLoaded);
					this.imageLoader.removeEventListener('error', this.imageLoadErr);
				}else{
					this.imageLoader.detachEvent('load', this.imageLoaded);
					this.imageLoader.detachEvent('error', this.imageLoadErr);
				}
			}
			this.imageLoader = null;
		},
		handleMove: function(e){
			var handlePos = {
				x: 0,
				y: 0
			}
			var mousePos  = {
					x: ( e.pageX ) ? e.pageX : e.clientX,
					y: ( e.pageY ) ? e.pageY : e.clientY
			}

			if( this.nowLoading ) return false;

			if( !this.nowAdded ){
				if( !this.nowWrap ){
					this.nowWrap = $(e.currentTarget);
				}
				if( this.nowWrap.attr('href') !== '#' && this.nowWrap.attr('href') !== '' ){
					this.nowWrap.trigger('mouseenter');
				}
				return false;
			}

			handlePos.x = mousePos.x - this.wrapOffset.left - ( this.handle.w / 2 );
			handlePos.y = mousePos.y - this.wrapOffset.top - ( this.handle.h / 2 );

			if( handlePos.x < 0 ){
				handlePos.x = 0;
			}else if( handlePos.x > this.limit.x ){
				handlePos.x = this.limit.x;
			}

			if( handlePos.y < 0 ){
				handlePos.y = 0;
			}else if( handlePos.y > this.limit.y ){
				handlePos.y = this.limit.y;
			}

			this.handle.obj.css({
				'left': handlePos.x,
				'top': handlePos.y
			})
			this.imageMove( handlePos );
		},
		imageMove: function( mousePos ){
			if( this.scope.img === null ) return false;

			this.scope.img.css({
				'left': -1 * ( ( this.scope.img.width() - this.scope.w ) / this.limit.x * mousePos.x),
				'top': -1 * ( ( this.scope.img.height() - this.scope.h ) / this.limit.y * mousePos.y)
			});
		}
	};

	/* product image change */
	shopUi.pdtImg = {
		init: function(){
			var _this = this;
			$body.on('click', '[data-big-image]', function(e){
				e.preventDefault();
				_this.change($(this));
				return false;
			});
			$('[data-big-image]').eq(0).trigger('click');
		},
		change: function( $obj ){
			var targetContainer = $('.js_big_image'),
				imgUrl = $obj.attr('href');

			if( imgUrl !== '#' && imgUrl !== '' && !imgUrl.match(/{{.*}}/g) ){
				$obj.parent().siblings('.is-active').removeClass('is-active');
				$obj.parent().addClass('is-active');
				targetContainer.attr('href', $obj.data('bigImage'));
				targetContainer.find('.inner').html('<img src="'+ $obj.attr('href') +'" alt="">');
			}
		}
	};

	shopUi.dateRangePicker = function(){
		$('.js_search_daterange').daterangepicker({
			'autoApply': true
		}, function(start, end, label) {
			// console.log('New date range selected: " + start.format("YYYY-MM-DD") + " to " + end.format("YYYY-MM-DD") + " (predefined range: " + label + ")');
		});
		$('.js_search_date').daterangepicker({
			'singleDatePicker': true,
			'autoApply': true
		}, function(start, end, label) {
			// console.log('New date range selected: " + start.format("YYYY-MM-DD") + " to " + end.format("YYYY-MM-DD") + " (predefined range: " + label + ")');
		});

		$('.js_search_daterange, .js_search_date').siblings('.icon').on('click', function(){
			$(this).siblings('input').trigger('click');
		});
	};

	/* 임시적인 함수*/
	shopUi.showProductLayer = function(){
		$body.on('click', '.js_quick_view', function(){
			$('#productLayer').fadeIn(500);
			shopUi.layerCtrl.opened = $('#productLayer');
			shopUtil.windowScrollbar.disable();
			shopUi.dimmed.show();
		});
		$body.on('click', '.js_quick_close', function(){
			$('#productLayer').fadeOut(500);
			shopUi.layerCtrl.opened = $('#productLayer');
			shopUtil.windowScrollbar.enable();
			shopUi.dimmed.hide();
		});
	};

	shopUi.layerCtrl = {
		opened: null,
		init: function(){
			var _this = this;
			$body
				.on('click', '[data-layer-open]', function(e){
					e.preventDefault();
					_this.show( $($(this).data( 'layerOpen' )) );
				})
				.on('click', '[data-layer-close]', function(e){
					e.preventDefault();
					_this.hide( $($(this).data( 'layerClose' )) );
				})
				.on('escape', function(e){
					e.preventDefault();
					_this.hide( _this.opened );
				});
		},
		show: function( obj ){
			if( this.opened ){
				this.hide( this.opened );
			}
			if( obj.length > 0 ){
				this.opened = obj;
				obj.show();
				shopUi.dimmed.show();
				shopUtil.windowScrollbar.disable();
			}
		},
		hide: function( obj ){
			if( obj ){
				obj.hide();
				shopUi.dimmed.hide();
				shopUtil.windowScrollbar.enable();
				this.opened = null;
			}
		}
	};

	shopUi.checkAll = {
		init: function(){
			var _this = this;
			$body
				.on('click', '[data-check-all]', function(){
					_this.check( $(this) );
				})
				.on('click', '[data-check]', function(){
					_this.falseAllCheck( $(this) );
				});
		},
		check: function( obj ){
			var $obj = obj,
				dataValue = $obj.data('checkAll'),
				$checkboxs = $('[data-check='+dataValue+']');

			if( $obj.is(':checked') ){
				this.trueAll($checkboxs);
			}else{
				this.falseAll($checkboxs);
			}
		},
		trueAll: function( $obj ){
			$obj.prop('checked', true);
		},
		falseAll: function( $obj ){
			$obj.prop('checked', false);
		},
		falseAllCheck: function( $obj ){
			var	dataValue = $obj.data('check'),
				$checkbox = $('[data-check-all='+dataValue+']');

			if( !$obj.is(':checked') ){
				$checkbox.prop('checked', false);
			}
		}
	};
	shopUi.foldContent = {
		btnSelector: '.js_fold_toggle',
		contentSelector: '.js_fold_content',
		init: function(){
			var _this = this,
				$buttons = $(this.btnSelector);

			this.stateUpdate();

			$body
				.on('toggle', this.btnSelector, function(e){
					e.preventDefault();
					_this.toggle($(this));
				})
				.on('click', this.btnSelector, function(e){
					e.preventDefault();
					$(this).trigger('toggle');
				});
		},
		stateUpdate: function(){
			var _this = this,
				$buttons = $(this.btnSelector),
				activeObj = $buttons.filter('.is-active'),
				$openObj;

			if( activeObj.length > 0 ){
				$openObj = activeObj;
			}else{
				$openObj = $buttons.eq(0);
			}

			$openObj.addClass('is-active');
			$openObj.siblings(this.contentSelector).addClass('is-active');
		},
		toggle: function($obj){
			var $content = $obj.siblings(this.contentSelector);

			if( $obj.hasClass('is-active') ){
				$content.stop().slideUp(this.duration);
				$obj.removeClass('is-active');
			}else{
				$content.stop().slideDown(this.duration);
				$obj.addClass('is-active');
			}
		}
	};

	shopUi.headerHnn = {
		closeBtnSelector: '.js_close_btn',
		listSelector: '.js_list',
		itemSelector: '.js_item',
		obj: null,
		now: 0,
		total: 0,
		timer: null,
		init: function(){
			var $item,
				objCount;

			this.obj = $('#hdrann');
			if( this.obj.length <= 0 ) return false;

			$item = this.obj.find(this.itemSelector);
			this.total = $item.length - 1;

			if( this.total >= 0 ){
				this.obj.find(this.itemSelector).eq(0).css('top',0);
				if( this.total >= 1 ){
					this.addEvent();
				}
			}else{
				this.obj.hide();
			}
		},
		addEvent: function(){
			var _this = this;
			this.startTimer();
			this.obj
				.on('mouseenter', function(){
					_this.stopTimer();
				})
				.on('mouseleave', function(){
					_this.startTimer();	
				});
		},
		startTimer: function(){
			var _this = this;

			if( this.timer ) return false;

			this.timer = setInterval(function(){

				_this.change(_this.obj);

			}, 4000);
		},
		stopTimer: function(){
			clearInterval(this.timer);
			this.timer = null;
		},
		change: function(){
			var $items = this.obj.find(this.itemSelector),
				$now_item = $items.eq(this.now),
				nextIdx,
				duration = 650;

			nextIdx = ( this.now === this.total ) ? 0 : this.now + 1;

			$now_item.animate({
				'top': '-100%'
			}, duration);
			
			$items.eq(nextIdx)
				.css('top', '100%')
				.animate({
					'top': '0'
				}, duration);

			this.now = nextIdx;
		}
	};

	shopUi.stylebook = {
		init: function(){
			this.slideImage();
			this.masonryImage();
		},
		slideImage: function(){
			var imageSlide,
				thumbSlide;
			var $imageTarget = $('#stylebook_big_image_slide'),
				nextBtnSelector = '.btn_styleslider_next',
				prevBtnSelector = '.btn_styleslider_prev',
				$countWrap = $('#stylebook_slide_count');

			var $thumbTarget = $('#stylebook_thumb_image_slide');

			if( $imageTarget.length <= 0 ){
				return false;
			}
			
			if( $imageTarget.find('.swiper-slide').length <= 1 ){
				$imageTarget.find('.btn_styleslider_prev, .btn_styleslider_next').hide();
				// return false;
			}
			imageSlide = Swiper($imageTarget, {
				spaceBetween: 0,
				speed: 850,
				preloadImages: false,
				lazyLoadingInPrevNext: true,
				lazyLoading: true,
				nextButton: nextBtnSelector,
				prevButton: prevBtnSelector,
				pagination: $countWrap,
				paginationType: 'fraction',
				paginationFractionRender: function (swiper, currentClassName, totalClassName) {
					return '<span class="now ' + currentClassName + '"></span>' +
					' / ' +
					'<span class="total ' + totalClassName + '"></span>';
				}
			});
			thumbSlide = Swiper($thumbTarget, {
				slidesPerView: 'auto',
				spaceBetween: 0,
				speed: 850,
				centeredSlides: true,
				initialSlide: 0,
				slideToClickedSlide: true
			});
			imageSlide.params.control = thumbSlide;
			thumbSlide.params.control = imageSlide;
		},
		masonryImage: function(){
			var $list = $('#stylebookMasonry'),
				$item,
				gridWidth,
				columnWidth,
				gridHeight = [0],
				gridColumn = 3,
				columnGap = 27,
				wrapHeight = 0,
				imgArr,
				imgLen;

			if( $list.length <= 0 ){
				return false;
			}
			imgArr = $list.find('img');
			imgLen = imgArr.length - 1;
			imgArr.each(function(){
				var loadImg = new Image;
				loadImg.src = this.src;
				loadImg.onload = function(){
					if( imgLen === 0){
						masonry();
					}
					--imgLen;
				};
			});

			function masonry(){
				gridWidth = $list.width();
				columnWidth = ((gridWidth - (columnGap * (gridColumn - 1))) / gridColumn);
				$item = $list.find('.stylebook_masonry_item');
				$item.css('width', columnWidth);

				$.each($item, function(i,el){
					var $el = $(el),
						gridIdx = 0,
						topValue;

					topValue = gridHeight[0];
					for(var i = 0; i <= gridColumn-1; i++){
						if( !gridHeight[i] ){
							gridHeight[i] = 0;
						}
						if( topValue > gridHeight[i] ){
							topValue = gridHeight[i];
							gridIdx = i;
						}
					}
					topValue = gridHeight[gridIdx];

					$el.css({
						'left': (columnWidth + columnGap) * gridIdx,
						'top': topValue + columnGap
					});

					gridHeight[gridIdx] += $el.height() + columnGap;

				});

				for(var i = 0; i <= gridColumn-1; i++){
					if(wrapHeight < gridHeight[i]){
						wrapHeight = gridHeight[i];
					}
				}
				$list.height(wrapHeight);
			}
		}


	};

	shopUi.thumbExpand = {
		selector: '.js_thumb_expanded',
		template: '<div class="data_thumb_expand"><img src={{src}} alt="thumb"></div>',
		init: function(){
			$body
				.on('mouseenter.thumbExpand', this.selector, $.proxy(this.mouseenter, this))
				.on('mouseleave.thumbExpand', this.selector, $.proxy(this.mouseleave, this));
		},
		mouseenter: function(e){
			var _this = this,
				$thumb,
				template,
				$this = $(e.currentTarget);

			this.removeExpand(e);
			template = this.template.replace('{{src}}', $this.find('img').attr('src'));
			$this.data('thumbExpand', $(template));

			$body.append( $this.data('thumbExpand') );
			$this.data('thumbExpand')
				.hide()
				.fadeIn(100);

			$this.on('mousemove.thumbExpand', function(e){
				_this.mousemove(e, $this.data('thumbExpand'));
			});
		},
		mouseleave: function(e){
			this.removeExpand(e);
		},
		mousemove: function(e, $activeObj){
			var $this = $(e.currentTarget),
				itemH,
				itemW;
			if( !$activeObj ) return false;

			itemH = $activeObj.outerHeight()
			itemW = $activeObj.outerWidth();
			$activeObj.css({
				'left': e.pageX + 15,
				'top': e.pageY + 15
			});
		},
		removeExpand: function(e){
			var $this = $(e.currentTarget),
				$activeObj = $this.data('thumbExpand');

			if( !$activeObj ) return false;

			$activeObj.fadeOut(100, function(){
				$activeObj.remove();
				$activeObj = null;
				$this.off('mousemove.thumbExpand');
			});
		}
	};
	shopUi.slideToggle = {
		init: function(){
			var _this = this;

			_this.reset();

			$body.on('click', '[data-slide-toggle]', function(e){
				e.preventDefault();
				_this.toggle($(this));
			});
		},
		reset: function(){
			$('[data-slide-toggle]').each(function(){
				var $this = $(this),
					$target = $($this.data('toggleTarget'));

				if( $this.hasClass('is-active') ) {
					$target.show();
				}else{
					$target.hide();
				}
			});
		},
		toggle: function($this){
			var $button = $this,
				$target = $($button.data('toggleTarget')),
				toggleObj = {},
				$targetInput = $target.find('input');

			if( $button.data('slideToggle') === 'width' ){	
				toggleObj = {
					'width': 'toggle'
				}
			}else{
				toggleObj = {
					'height': 'toggle'
				}
			}
			$target.stop().animate(
				toggleObj,
				{
					'duration': 500,
					'easing': 'easeInOutQuad'
				}
			);
			if( !$button.hasClass('is-acitve') && $targetInput.length > 0 ){
				$targetInput.focus();
			}
			$button.toggleClass('is-active');
		}

	};

	shopUi.gMenu = {
		wrap: null,
		init: function(){
			var _this = this;
			this.wrap = $('#gMenu');

			$window.on('scroll', function(){
				_this.scrollCheck();
			});
		},
		scrollCheck: function(){
			var scrollTop = $window.scrollTop(),
					wrapTop = this.wrap.offset().top,
					isFixed = this.wrap.hasClass('is-fixed');

			if( scrollTop >= wrapTop && !isFixed ){
				this.wrap
					.addClass('is-fixed')
					.css({'height':this.wrap.find('.g_menu_fixed').height()});

			}else if( scrollTop < wrapTop && isFixed ){
				this.wrap
					.removeClass('is-fixed')
					.css({'height':'auto'});
			}
		}
	};

	shopUi.fileInput = {
		selector: '.commfile',
		init: function(){
			var _this = this;
			$body
				.on('change', this.selector + ' input[type=file]', this.changeFile)
				.on('click', '.js_del_file', function(){
					var $target = $(this).closest('.commfile').find('.file')
					_this.reset( $target );
				});
		},
		changeFile: function(){
			var _this = shopUi.fileInput,
				$this = $(this),
				$wrap = $this.closest('.commfile'),
				$name = $wrap.find('.name'),
				fileNames = _this.getFileName(this),
				accepts = _this.getAccept($this),
				insertTxt = '';

			if( accepts ){
				if(!_this.checkExtension(fileNames, accepts)){
					alert( 'Invalid file format! Must be ' + accepts.toUpperCase().replace(/\./g,'') );
					_this.reset($(this));
					return false;
				}
			}

			if( fileNames !== '' ){
				$wrap.addClass('is-active');
				insertTxt = fileNames;
			}else{
				$wrap.removeClass('is-active');
			}
			$name
				.val(insertTxt)
				.click();
		},
		getAccept: function($input){
			var accept = $input.attr('accept'),
				accepts = (accept) ? accept.toLowerCase() : false;

			if( accepts ){
				if( accepts.indexOf('.jpg') > -1 ){
					accepts += ', .jpeg';
				}
			}

			return accepts;
		},
		getFileName: function(input){
			var names = '',
				files = input.files,
				multi;

			if( files ){
				multi = ( files.length > 1 ) ? true : false;

				for( var i = 0; i < files.length; i++ ) {
					if( multi && i > 0 ){
						names += ' | ';
					}
					names += files[i].name.toLowerCase();
				}
			}else{
				names = input.value.match(/[^\/\\]+$/)[0].toLowerCase();
			}
			return names;
		},
		checkExtension: function(filenames, accept){
			var filenameArr = filenames.replace(/\s/g,'').split('|'),
				confirm = true;

			for( var i in filenameArr ){
				filenameArr[i] = filenameArr[i].replace(/(.*\.)/,'.');
				if( accept.indexOf(filenameArr[i]) < 0 ){
					confirm = false;
				}
			}
			return confirm;
		},
		reset: function($file){
			var agent = navigator.userAgent.toLowerCase(),
				$wrap = $file.closest('.commfile'),
				$text = $wrap.find('.name');
			if ( (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) || (agent.indexOf('msie') !== -1) ){
				$file.replaceWith( $file.clone(true) );
			} else {
				$file.val('');
			}
			$text
				.val('')
				.click();
			$wrap.removeClass('is-active');
		}
	};

	window.shopInit = shopInit;
	window.shopUi = shopUi;
	window.shopUtil = shopUtil;

	/* init function */
	function shopInit(){
		$gWrap = $('#gWrap');

		shopUi.createYoutubePlayer.init();
		shopUi.mainGallery.init();

		shopUi.gMenu.init();

		shopUi.bodyEscape();
		shopUi.sideCart.init();
		shopUi.toggleSlide.init();
		shopUi.optionSlider.init();
		shopUi.priceSlider();
		shopUi.pdtMagnifier.init();
		shopUi.pdtImg.init();
		shopUi.pdtListToggle.init();
		shopUi.dateRangePicker();
		shopUi.showProductLayer();
		shopUi.layerCtrl.init();
		shopUi.checkAll.init();
		shopUi.foldContent.init();
		shopUi.headerHnn.init();
		shopUi.thumbExpand.init();
		shopUi.slideToggle.init();
		shopUi.fileInput.init();
	}

	$(document).ready(function(){
		shopInit();
	});

})(this, this.document, this.jQuery);