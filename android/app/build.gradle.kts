plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.jarvisfit.app"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.jarvisfit.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 13
        versionName = "1.3.0-dev"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
dependencies { implementation("androidx.core:core-ktx:1.15.0") }
