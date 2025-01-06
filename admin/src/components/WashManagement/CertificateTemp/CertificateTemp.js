import { StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff"
  },
  header: {
    marginBottom: 30
  },
  img_container: {
    position: "relative"
  },
  img_text_container: {
    position: "absolute",
    top: "15%",
    left: 0,
    right: 0
  },
  certificate_no_box: {
    position: "absolute",
    right: "10px",
    bottom: "30.5%"
  },
  overlayText: {
    fontSize: 40,
    fontWeight: 700,
    textAlign: "center",
    color: "#ffffff",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"
  },
  overlayText_p: {
    fontSize: 16,
    fontWeight: 600,
    textAlign: "center",
    color: "#ffffff",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"
  },
  text_c2: {
    fontSize: 12,
    fontWeight: 600,
    color: "#ffffff"
  },
  text_no_c2: {
    fontSize: 12,
    fontWeight: 600
  },
  text_p2: {
    fontSize: 14,
    fontWeight: 600
  },
  text_h5: {
    fontSize: 32,
    fontWeight: 600,
    color: "#1F59AF"
  },
  p_title_text: {
    fontSize: 14,
    fontFamily: "Metropolies", // Use the registered font family name
    fontWeight: "normal",
    lineHeight: "1.2px"
  },
  p_bold_text: {
    fontSize: 14,
    fontFamily: "Metropolies", // Use the registered font family name
    fontWeight: "bold",
    lineHeight: "1.2px"
  },
  p_italic_text: {
    fontSize: 14,
    fontFamily: "Metropolies", // Use the registered font family name
    fontWeight: "ultralight",
    lineHeight: "1.2px"
  },
  container: {
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    marginBottom: 30
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10
  },
  name: {
    fontSize: 20,
    fontWeight: "bold"
  },
  m16: {
    marginTop: "16px"
  },
  divider_box: {
    width: "75%",
    marginTop: "16px"
  },
  bottom_line: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px"
  },
  line: {
    width: "50%",
    height: "2px",
    backgroundColor: "#1F59AF"
  },
  dot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    backgroundColor: "#1F59AF",
    margin: "0 10px"
  },
  paragraph_box: {
    padding: "16px"
  },
  mt_paragraph_box: {
    marginTop: "20px"
  },
  img_btm_box: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  img_logo_box: {
    padding: "16px"
  },
  logo_image: {
    maxWidth: "90px",
    width: "100%"
  }
})

export default styles
