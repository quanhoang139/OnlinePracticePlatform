import { FacebookOutlined, YoutubeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "../../assets/styles/footer.css"

const Footer = () => {
    return (
        <footer className="bg-light pt-2 footer">
            <div className=".container-fluid">
                <div className="row">
                    {/* Logo Website */}
                    <div className="col-md-2 mb-3">
                        <img src="/logo.png" alt="Logo" className="img-fluid" />
                    </div>

                    {/* Chính sách */}
                    <div className="col-md-2 mb-3">
                        <h4 className="font-weight-bold" style={{ textAlign: "left" }}>Chính sách</h4>

                        <ul className="list-unstyled policy-list">
                            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
                            <li><Link to="/payment">Hình thức thanh toán</Link></li>
                            <li><Link to="/complaints">Chính sách khiếu nại</Link></li>
                            <li><Link to="/news">Tin tức tổng hợp</Link></li>
                            <li><Link to="/recruitment">Tuyển dụng</Link></li>
                        </ul>
                    </div>


                    {/* Liên hệ */}
                    <div className="col-md-2 mb-3">
                        <h4 className="font-weight-bold text-left">Liên hệ với chúng tôi</h4>
                        <ul className="list-unstyled contact-list">
                            <li>Tên công ty: Công ty ABC</li>
                            <li>Địa chỉ: 123 Đường XYZ, Hà Nội</li>
                            <li>Số điện thoại: 0123-456-789</li>
                            <li>Người đại diện: Nguyễn Văn A</li>
                            <li>Email: <a href="21020786@vnu.edu.vn">21020786@vnu.edu.vn</a></li>
                        </ul>
                    </div>

                    {/* Mạng xã hội & Ứng dụng di động */}
                    <div className="col-md-2 mb-3" style={{verticalAlign: "middle"}}>
                        {/* <div>
                            <a href="https://facebook.com" className="mr-3 text-dark"><FacebookOutlined style={{ fontSize: "24px" }} /></a>
                            <a href="https://youtube.com" className="text-dark"><YoutubeOutlined style={{ fontSize: "24px" }} /></a>
                        </div> */}
                        <div className="d-flex justify-content-between social-container">
                            <a href="https://facebook.com" className="social-icon icon-facebook">
                                <i className="fa-brands fa-facebook"></i>
                            </a>
                            <a href="https://youtube.com" className="social-icon icon-youtobe">
                                <i className="fa-brands fa-youtube"></i>
                            </a>
                            <a href="https://tiktok.com" className="social-icon icon-tiktok">
                                <i className="fa-brands fa-tiktok"></i>
                            </a>
                        </div>



                        <div className="app-links">
                            <a href="https://play.google.com/store/apps?hl=vi" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="/android.svg"
                                    alt="CH Play"
                                    className="img-fluid mr-2"
                                    style={{ maxWidth: "120px", height: "120px", objectFit: "contain" }}
                                />
                            </a>
                            <a href="https://developer.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="/ios.svg"
                                    alt="App Store"
                                    className="img-fluid mr-2"
                                    style={{ maxWidth: "140px", height: "120px", objectFit: "contain" }}
                                />
                            </a>
                        </div>
                    </div>

                    {/* Bản đồ */}
                    <div className="col-md-4 mt-2 mb-2">
                        <iframe
                            title="Google Maps"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4495.087132912583!2d105.78189717590297!3d21.029274987759607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab37c5ee30e7%3A0x7edfcc7d49a4c3af!2sVjco!5e1!3m2!1svi!2s!4v1742915244828!5m2!1svi!2s"
                            width="100%"
                            height="180"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-dark text-white text-center py-3 mt-0">
                Copyright © 2025 Website của bạn. All rights reserved.
            </div>
        </footer >
    );
};

export default Footer;
