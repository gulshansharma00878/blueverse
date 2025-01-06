import React from "react"
import { Document, Page, Text, View, Image, Font } from "@react-pdf/renderer"
import certificateHeader from "assets/images/backgrounds/certificate_header.png"

// import font for certificate template
import normalFont from "fonts/metropolis.light.otf"
import BoldFont from "fonts/metropolis.medium.otf"
import ItalicFont from "fonts/metropolis.light-italic.otf"

import swachhBharat from "assets/images/Logo/image_1.png"
import makeIndia from "assets/images/Logo/make_india.png"
// import tvsMotor from "assets/images/Logo/TVS_Motor_logo.png"

import styles from "./CertificateTemp.js"

// Register Font Family
Font.register({
  family: "Metropolies",
  fonts: [
    { src: normalFont, fontWeight: "normal" },
    { src: BoldFont, fontWeight: "bold" },
    { src: ItalicFont, fontWeight: "ultralight" }
  ]
})

const CertificateTemp = ({ certificateData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.img_container}>
        <Image style={styles.headerImage} src={certificateHeader} />
        <View style={styles.img_text_container}>
          <Text style={styles.overlayText}>Certificate</Text>
          <Text style={styles.overlayText_p}>For Water Conservation</Text>
        </View>
        <View style={styles.certificate_no_box}>
          <View>
            <Text style={styles.text_c2}>BlueVerse</Text>
            <Text style={styles.text_c2}>Certificate no.</Text>
          </View>
          <Text style={styles.text_no_c2}>{certificateData?.certificate}</Text>
        </View>
      </View>
      <View style={styles.container}>
        <Text style={styles.text_p2}>Presented To</Text>
        <View style={styles.m16}>
          <Text style={styles.text_h5}>
            {certificateData?.name ? certificateData?.name : "Customer Name"}
          </Text>
        </View>
        <View style={styles.divider_box}>
          <View style={styles.bottom_line}>
            <Text style={styles.line}></Text>
            <Text style={styles.dot}></Text>
            <Text style={styles.line}></Text>
          </View>
        </View>
      </View>
      <View style={styles.paragraph_box}>
        <View style={styles.text_box}>
          <Text style={styles.p_title_text}>
            This certifies that{" "}
            <Text style={styles.p_bold_text}>
              {certificateData?.name ? certificateData?.name : "Customer Name"}{" "}
            </Text>{" "}
            has washed his 2 wheeler{" "}
            {/* <Text style={styles.p_bold_text}>TVSM Service Centre </Text> */}
            using the <Text style={styles.p_bold_text}>BlueVerse </Text> automated 2 wheeler vehicle
            washing machine and has conserved <Text style={styles.p_bold_text}> 180 Lts </Text> of
            water recycling more than <Text style={styles.p_bold_text}>98% </Text>of the water used
            for the wash.
          </Text>
        </View>
        <View style={styles.mt_paragraph_box}>
          <Text style={styles.p_title_text}>
            Your efforts in conserving water are commendable and we thank you for taking this step
            in protecting our planet’s valuable resources.
          </Text>
        </View>
        <View style={styles.mt_paragraph_box}>
          <Text style={styles.p_italic_text}>
            Every small change leads to a big impact! We sincerely thank you for contributing to a
            sustainable future!
          </Text>
        </View>
      </View>
      <View style={styles.img_btm_box}>
        <View style={styles.img_logo_box}>
          <Image src={swachhBharat} style={styles.logo_image} />
        </View>
        <View style={styles.img_logo_box}>
          <Image src={makeIndia} style={styles.logo_image} />
        </View>
        {/* <View style={styles.img_logo_box}>
          <Image src={tvsMotor} />
        </View> */}
      </View>
    </Page>
  </Document>
)

export default CertificateTemp
