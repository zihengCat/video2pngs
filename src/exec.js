const os    = require('os');
const exec  = require('child_process').exec;
const spawn = require('child_process').spawn;
const {dialog} = require('electron').remote;

function open_dialog(flag) {
    /*
    let ret = dialog.showOpenDialog({properties: ['openFile']});
    let ret = dialog.showOpenDialog({properties: ['openFile']});
    let open_path = document.querySelector("#open-path");
    let save_path = document.querySelector("#save-path");
    */
    if(flag === "open") {
        let ret = dialog.showOpenDialog({properties: ['openFile']});
        let open_path = document.querySelector("#open-path");
        open_path.innerText = ret[0];

        let v = document.querySelector("video");
        v.src = ret[0];
        v.className = "visible";
    }
    else if(flag === "save") {
        let ret = dialog.showOpenDialog({properties: ['openDirectory']});
        let save_path = document.querySelector("#save-path");
        save_path.innerText = ret[0];
    }
}

function getVideoTime(flag) {
    let v      = document.querySelector("video");
    let s_time = document.querySelector("#s-time");
    let e_time = document.querySelector("#e-time");
    let d_time = document.querySelector("#d-time");

    if(flag === "start") {
        s_time.value = sec2time(v.currentTime.toString());
    }
    else if(flag === "end") {
        e_time.value = sec2time(v.currentTime.toString());
    }
    else if(flag === "diff") {
        d_time.value = timeDiff(s_time.value, e_time.value);
    }
}
function getVideoXY() {
    let v   = document.querySelector("video");
    let v_h = document.querySelector("#v-height");
    let v_w = document.querySelector("#v-width");

    v_h.value = v.videoHeight.toString();
    v_w.value = v.videoWidth.toString();
}

function getFPS() {
    let fps = document.querySelector("#fps");
    fps.value = "16";
}

function doReset() {
    let s_time   = document.querySelector("#s-time");
    let e_time   = document.querySelector("#e-time");
    let d_time   = document.querySelector("#d-time");
    let v_height = document.querySelector("#v-height");
    let v_width  = document.querySelector("#v-width");
    let fps      = document.querySelector("#fps");

    s_time.value   =
    e_time.value   =
    d_time.value   =
    v_height.value =
    v_width.value  =
    fps.value      =  "";
}

function showOptionValue() {
    let s_time   = document.querySelector("#s-time").value;
    let e_time   = document.querySelector("#e-time").value;
    let d_time   = document.querySelector("#d-time").value;
    let v_height = document.querySelector("#v-height").value;
    let v_width  = document.querySelector("#v-width").value;
    let fps      = document.querySelector("#fps").value;

    console.log( s_time   + ", " +
                 e_time   + ", " +
                 d_time   + ", " +
                 v_height + ", " +
                 v_width  + ", " +
                 fps );
}

function timeDiff(t1, t2){
    let d_time = getSec(t2) - getSec(t1);
    return d_time;

    function getSec(t){
        let t_p1 = t.split(".")[0];
        let t_p1_sec =
                      parseInt(t_p1.split(":")[0]) * 3600 +
                      parseInt(t_p1.split(":")[1]) * 60   +
                      parseInt(t_p1.split(":")[2]) * 1;
        return t_p1_sec;
    }

}

function sec2time(s) {
    let time_sec = s.split(".")[0];
    time_sec = parseInt(time_sec);
    let sep = s.substr(s.indexOf(".") + 1 , 1);
    if( parseInt(sep) >= 5){
        time_sec += 1;
    }
    else{
        time_sec += 0;
    }
    // console.log(time_sec, sep);

    let hh = Math.floor(time_sec / 3600);
    time_sec -= hh * 3600;

    hh = hh < 10 ? "0" + hh.toString() : hh.toString();

    let mm = Math.floor(time_sec / 60);
    time_sec -= mm * 60;
    mm = mm < 10 ? "0" + mm.toString() : mm.toString();

    let ss = time_sec;
    ss = ss < 10 ? "0" + ss.toString() : ss.toString();

    /* hh:mm:ss SPE(.) ff */

    f_str = hh + ":" +
            mm + ":" +
            ss + "." + "00";

    // console.log(f_str);
    return f_str;
}



function doDialog() {
    let ret = doSubmit();
    if(ret == 0) {
        window.alert("转换完成！");
    }
    else {
        window.alert("转换失败...");
    }
}

function doSubmit() {
    let filename  = document.querySelector("#open-path").innerText;
    let outpath   = document.querySelector("#save-path").innerText;
    let s_time    = document.querySelector("#s-time").value;
    let t_time    = document.querySelector("#d-time").value;
    let v_width   = document.querySelector("#v-width").value;
    let v_height  = document.querySelector("#v-height").value;
    let fps       = document.querySelector("#fps").value;
    let format_str = "frame_%03d.png"
    /*
    console.log(filename, outpath, format_str,
                s_time,   t_time,  fps);
    console.log(
        "-s", v_width + "x" + v_height,
        outpath + format_str);
    */
    if( filename !== "" &
        outpath  !== "" &
        s_time   !== "" &
        t_time   !== "" &
        v_width  !== "" &
        v_height !== "" &
        fps      !== "" &
        format_str !== "") {
        ffmpegExec(filename, outpath, format_str,
                   s_time,   t_time,  v_width, v_height, fps);
        return 0;
    }
    else {
        return 1;
    }
}

function ffmpegExec(filename, outpath, format_str,
                    s_time,   t_time,  v_width, v_height, fps) {

    let cmdExec;
    if(os.type() == "Linux"  ||
       os.type() == "Darwin")
    {
        cmdExec = "ffmpeg";
    }
    else if(os.type() == "Windows_NT") {
        cmdExec = ".\\static\\bin\\ffmpeg.exe";
    }

    let child = spawn(cmdExec, [
        "-ss", s_time,
        "-i",  filename,
        "-t",  t_time,
        "-r",  fps,
        "-s",  v_width + "x" + v_height,
               outpath + "/" + format_str
    ]);

    child.stdout.on('data', function(chunk) {
      // output will be here in chunks
      // console.log("stdout: ", chunk);
    });

    //let info = document.querySelector("#progress-info");
    //info.value = "";
    child.stderr.on('data', function(chunk) {
      // output will be here in chunks
      //info.value += `${chunk}`;
      console.log(`${chunk}`);

      /*
      let re_patt = /\d\d:\d\d:\d\d.\d\d/g;
      let err_text = `${chunk}`;
      if (err_text.match(re_patt)) {
          console.log(err_text.match(re_patt)[0]);
      }
      */
    });

    // or if you want to send output elsewhere
    // child.stdout.pipe(dest);
}

