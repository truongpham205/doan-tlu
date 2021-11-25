#image 
FROM mysql:8.0.22

# những thông tin bắt buộc cho việc khởi tạo 
# có thể nhập những thông tin này trong lệnh build thay vì nhập ở đây
# nếu sử dụng docer compose thì có thể khởi tạo bằng file .env
ENV MYSQL_ROOT_PASSWORD=123456a@
ENV MYSQL_DATABASE=ohotour
ENV MYSQL_USER=ohotour
ENV MYSQL_PASSWORD=123456a@



#chạy các lệnh cần thiết
# RUN --default-authentication-plugin=mysql_native_password

# lệnh build image: docker build -t db .
# lệnh hiển thị các images đã build thành công: docker images

# lệnh run db: docker run  -p 8667:3306 db

# lệnh đầy đủ để run images 
# insert dữ liệu mẫu, cấu hình giờ hệ thống, cấu hình nhập được tiếng việt (unicode)