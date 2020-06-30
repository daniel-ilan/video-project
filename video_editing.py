from moviepy.editor import VideoFileClip, CompositeVideoClip, vfx

"""
animations = {dict} {'animation': 'large0.webm', 'time': 0.20064499999716645}
 'animation'  = {str} 'large0.webm'
 'time'  = {float} 0.20064499999716645
 
 
 <class 'dict'>: {'name': '1592935677543.mkv'}
 """


def make_video(animations, video, path, video_file_name):
    path = path
    background = VideoFileClip(path + video['name'])
    clips = [background]
    for index, animation in enumerate(animations):
        to_clip = path + animation['name']
        start_time = animation['start_time']
        clip = VideoFileClip(to_clip)
        masked_clip = clip.fx(vfx.mask_color, color=[0, 0, 0], thr=35, s=40)
        clips.append(masked_clip.set_start(start_time))

    video = CompositeVideoClip(clips)
    video.write_videofile(f"{path}{video_file_name}.mp4")
    video.close()




