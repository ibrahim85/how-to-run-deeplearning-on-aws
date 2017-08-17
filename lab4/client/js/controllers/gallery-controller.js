function GalleryController($scope, $interval, $http, config) {
  var cfg = config.prod;

  region = cfg.region; // Region
  creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cfg.identity_pool_id,
  });

  AWS.config.update({
    region: region,
    credentials: creds
  });

  var predict_url = cfg.predict_url;

  var identityId = AWS.config.credentials.identityId;
  console.log('Identity ID (Unauthenticated) : ', identityId);

  var bucketName = cfg.upload_bucket_name;


  $scope.bucket_images = null;

  var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: bucketName }
  });

  // Utils for UI 
  function toggleBtn(btn, action) {
    if (action == "loading") {
      btn.html(btn.data("loading-text"));
      btn.attr("disabled", "disabled");
    }
    else if (action == "reset") {
      btn.html(btn.data("original-text"));
      btn.removeAttr("disabled");
    }
  }
  $scope.toggleLoader = function (spinner, action) {
    if (spinner != null) {
      if (action == "show") {
        spinner.css({
          height: spinner.parent().height(),
          width: spinner.parent().width()
        });
        spinner.show();
      }
      else if (action == "hide") {
        spinner.hide();
      }
    }
  }
  // end of Utils for UI 


  $scope.upload_image = function () {
    toggleBtn($("#btn_upload"), "loading");

    var files = document.getElementById('image_file').files;
    if (!(files != null && files.length > 0)) {
      toastr.error('There was no file selected.');
      toggleBtn($("#btn_upload"), "reset");
      return;
    }
    var file = files[0];

    var path_prefix = '';
    var random_number = Math.floor(Math.random() * 9000000000);
    var file_key = path_prefix + random_number + "_" + file.name;

    s3.upload({
      Key: file_key,
      Body: file,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) {
        toggleBtn($("#btn_upload"), "reset");
        $scope.$apply();
        return toastr.error('There was an error uploading your photo: ', err.message);
      }
      toastr.success('Successfully Uploaded photo.');
      toggleBtn($("#btn_upload"), "reset");

      predictItem(data.Location, $scope.bucket_images.length);
      var Obj = { Key: file_key, URL: data.Location };
      $scope.bucket_images.push(Obj);
      $scope.$apply();
    });
  };

  $scope.delete_photo = function (photoKey, index) {
    keys = [];
    keys.push({ Key: photoKey });
    var params = {
      Delete: { Objects: keys }
    };
    s3.deleteObjects(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        return toastr.error('There was an error deleting your photo: ', err.message);
      }
      toastr.success('Successfully deleted photo.');
      $scope.bucket_images.splice(index, 1);
      $scope.$apply();
    });
  };

  refreshGallery = function () {
    s3.listObjects(function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else    // successful response
      {
        var href = this.request.httpRequest.endpoint.href;
        var bucketUrl = href + bucketName + '/';

        var photos = data.Contents.map(function (photo, index) {


          predictItem(bucketUrl + encodeURIComponent(photo.Key), index);

          var Obj = { Key: photo.Key, URL: bucketUrl + encodeURIComponent(photo.Key) };
          return Obj;
        });
        $scope.bucket_images = photos;

      }
    });
  };

  // For Malformed json response (due to 'mxnet-lambda' project issue)

  function specialTransform(data) {
    console.log("Start Manual JSON Parsing : ", data)

    var temp = data.replace(/, probability=/g, "\"} ,{\"score\":\"").replace(/, class=/g, "\", \"name\":\"").replace(/^probability=/g, "[{\"score\":\"").replace(/, \n$/g, "\"}]");
    return JSON.parse(temp);
  }

  // Connect to lambda
  function predictItem(key, index) {
    $scope.toggleLoader($("#spinner-wrapper_" + index), "show");

    var data = { url: key };
    var result = null
    var req = {
      method: 'POST',
      url: predict_url,
      headers: {
        'Content-Type': "text/plain"
      },
      data: data,
      responseType: "text",
      transformResponse: specialTransform
    }
    $http(req).then(
      function (response) {

        $scope.bucket_images[index].Item = response.data;
        $scope.bucket_images[index].time = (response.config.responseTimestamp - response.config.requestTimestamp) / 1000;

        $scope.toggleLoader($("#spinner-wrapper_" + index), "hide");
      },
      function (err) {
        toastr.error('There was an error to access to lambda : ', err.message);

        $scope.toggleLoader($("#spinner-wrapper_" + index), "hide");
      });
    $scope.$apply();
  }

  // on-load event
  angular.element(window.document.body).ready(function () {
    refreshGallery();
  });
}

angular.module('gallery-controller', []).controller('GalleryController', GalleryController);

