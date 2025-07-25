import {
  DispatchAction,
  SafeAreaModal,
  Screens,
  testIdWithKey,
  TOKENS,
  useAuth,
  useServices,
  useStore,
  useTheme,
  LockoutReason,
} from '@bifold/core'
import { RemoteLogger, RemoteLoggerEventTypes } from '@bifold/remote-logs'
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { BCDispatchAction, BCState, Mode } from '@/store'
import IASEnvironment from './IASEnvironment'
import RemoteLogWarning from './RemoteLogWarning'
import { BCThemeNames } from '@/constants'

const Developer: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore<BCState>()
  const { lockOutUser } = useAuth()
  const { SettingsTheme, TextTheme, ColorPallet, setTheme, themeName } = useTheme()
  const [logger] = useServices([TOKENS.UTIL_LOGGER]) as [RemoteLogger]
  const [environmentModalVisible, setEnvironmentModalVisible] = useState<boolean>(false)
  const [devMode, setDevMode] = useState<boolean>(true)
  const [useVerifierCapability, setUseVerifierCapability] = useState<boolean>(!!store.preferences.useVerifierCapability)
  const [acceptDevCredentials, setAcceptDevCredentials] = useState<boolean>(!!store.preferences.acceptDevCredentials)
  const [useConnectionInviterCapability, setConnectionInviterCapability] = useState(
    !!store.preferences.useConnectionInviterCapability
  )
  const [remoteLoggingWarningModalVisible, setRemoteLoggingWarningModalVisible] = useState(false)
  const [useDevVerifierTemplates, setDevVerifierTemplates] = useState(!!store.preferences.useDevVerifierTemplates)
  const [enableWalletNaming, setEnableWalletNaming] = useState(!!store.preferences.enableWalletNaming)
  const [preventAutoLock, setPreventAutoLock] = useState(!!store.preferences.preventAutoLock)
  const [remoteLoggingEnabled, setRemoteLoggingEnabled] = useState(logger?.remoteLoggingEnabled)
  const [enableShareableLink, setEnableShareableLink] = useState(!!store.preferences.enableShareableLink)
  const [enableProxy, setEnableProxy] = useState(!!store.developer.enableProxy)
  const [enableAltPersonFlow, setEnableAltPersonFlow] = useState(!!store.developer.enableAltPersonFlow)
  const [enableAppToAppPersonFlow, setEnableAppToAppPersonFlow] = useState(!!store.developer.enableAppToAppPersonFlow)
  const navigation = useNavigation()

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      width: '100%',
    },
    section: {
      backgroundColor: SettingsTheme.groupBackground,
      padding: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 0,
    },
    sectionSeparator: {
      marginBottom: 10,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowTitle: {
      ...TextTheme.headingFour,
      flex: 1,
      fontWeight: 'normal',
      flexWrap: 'wrap',
    },
    rowSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: ColorPallet.brand.primaryBackground,
      marginHorizontal: 24,
    },
    logo: {
      height: 64,
      width: '50%',
      marginVertical: 16,
    },
    footer: {
      marginVertical: 25,
      alignItems: 'center',
    },
  })

  const shouldDismissModal = () => {
    setEnvironmentModalVisible(false)
  }

  const SectionHeader = ({ icon, title }: { icon: string; title: string }): JSX.Element => (
    <View style={[styles.section, styles.sectionHeader]}>
      <Icon name={icon} size={24} style={{ marginRight: 10, color: TextTheme.normal.color }} />
      <Text style={[TextTheme.headingThree, { flexShrink: 1 }]}>{title}</Text>
    </View>
  )

  interface SectionRowProps {
    title: string
    accessibilityLabel?: string
    testID?: string
    children: JSX.Element
    showRowSeparator?: boolean
    subContent?: JSX.Element
    onPress?: () => void
  }
  const SectionRow = ({
    title,
    accessibilityLabel,
    testID,
    onPress,
    children,
    showRowSeparator,
    subContent,
  }: SectionRowProps) => (
    <>
      <View style={styles.section}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Pressable
            onPress={onPress}
            accessible={true}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            style={styles.sectionRow}
          >
            {children}
          </Pressable>
        </View>
        {subContent}
      </View>
      {showRowSeparator && (
        <View style={{ backgroundColor: SettingsTheme.groupBackground }}>
          <View style={styles.rowSeparator}></View>
        </View>
      )}
    </>
  )

  const toggleSwitch = () => {
    dispatch({
      type: DispatchAction.ENABLE_DEVELOPER_MODE,
      payload: [!devMode],
    })
    setDevMode(!devMode)
  }

  const toggleVerifierCapabilitySwitch = () => {
    // if verifier feature is switched off then also turn off the dev templates
    if (useVerifierCapability) {
      dispatch({
        type: DispatchAction.USE_DEV_VERIFIER_TEMPLATES,
        payload: [false],
      })
      setDevVerifierTemplates(false)
    }
    dispatch({
      type: DispatchAction.USE_VERIFIER_CAPABILITY,
      payload: [!useVerifierCapability],
    })
    setUseVerifierCapability((previousState) => !previousState)
  }

  const toggleAcceptDevCredentialsSwitch = () => {
    dispatch({
      type: DispatchAction.ACCEPT_DEV_CREDENTIALS,
      payload: [!acceptDevCredentials],
    })
    setAcceptDevCredentials((previousState) => !previousState)
  }

  const toggleConnectionInviterCapabilitySwitch = () => {
    dispatch({
      type: DispatchAction.USE_CONNECTION_INVITER_CAPABILITY,
      payload: [!useConnectionInviterCapability],
    })
    setConnectionInviterCapability((previousState) => !previousState)
  }

  const toggleDevVerifierTemplatesSwitch = () => {
    // if we switch on dev templates we can assume the user also
    // wants to enable the verifier capability
    if (!useDevVerifierTemplates) {
      dispatch({
        type: DispatchAction.USE_VERIFIER_CAPABILITY,
        payload: [true],
      })
      setUseVerifierCapability(true)
    }
    dispatch({
      type: DispatchAction.USE_DEV_VERIFIER_TEMPLATES,
      payload: [!useDevVerifierTemplates],
    })
    setDevVerifierTemplates((previousState) => !previousState)
  }

  const toggleWalletNamingSwitch = () => {
    dispatch({
      type: DispatchAction.ENABLE_WALLET_NAMING,
      payload: [!enableWalletNaming],
    })

    setEnableWalletNaming((previousState) => !previousState)
  }

  const toggleRemoteLoggingSwitch = () => {
    if (remoteLoggingEnabled) {
      const remoteLoggingEnabled = false

      DeviceEventEmitter.emit(RemoteLoggerEventTypes.ENABLE_REMOTE_LOGGING, remoteLoggingEnabled)
      setRemoteLoggingEnabled(remoteLoggingEnabled)

      dispatch({
        type: BCDispatchAction.REMOTE_DEBUGGING_STATUS_UPDATE,
        payload: [{ enabled: remoteLoggingEnabled, expireAt: undefined }],
      })

      return
    }

    setRemoteLoggingWarningModalVisible(true)
  }

  const onEnableRemoteLoggingPressed = () => {
    const remoteLoggingEnabled = true
    DeviceEventEmitter.emit(RemoteLoggerEventTypes.ENABLE_REMOTE_LOGGING, remoteLoggingEnabled)
    dispatch({
      type: BCDispatchAction.REMOTE_DEBUGGING_STATUS_UPDATE,
      payload: [{ enabledAt: new Date(), sessionId: logger.sessionId }],
    })
    setRemoteLoggingEnabled(remoteLoggingEnabled)

    setRemoteLoggingWarningModalVisible(false)

    if (store.authentication.didAuthenticate) {
      navigation.navigate(Screens.Home as never)
    }
  }

  const onRemoteLoggingBackPressed = () => {
    setRemoteLoggingWarningModalVisible(false)
  }

  const togglePreventAutoLockSwitch = () => {
    dispatch({
      type: DispatchAction.PREVENT_AUTO_LOCK,
      payload: [!preventAutoLock],
    })

    setPreventAutoLock((previousState) => !previousState)
  }

  const toggleShareableLinkSwitch = () => {
    dispatch({
      type: DispatchAction.USE_SHAREABLE_LINK,
      payload: [!enableShareableLink],
    })
    setEnableShareableLink((previousState) => !previousState)
  }

  const toggleEnableProxySwitch = () => {
    dispatch({
      type: BCDispatchAction.TOGGLE_PROXY,
      payload: [!enableProxy],
    })
    setEnableProxy((previousState) => !previousState)
  }

  const toggleEnableAltPersonFlowSwitch = () => {
    dispatch({
      type: BCDispatchAction.TOGGLE_ALT_PERSON_FLOW,
      payload: [!enableAltPersonFlow],
    })
    setEnableAltPersonFlow((previousState) => !previousState)
  }

  const toggleEnableAppToAppPersonFlowSwitch = () => {
    dispatch({
      type: BCDispatchAction.TOGGLE_APP_TO_APP_PERSON_FLOW,
      payload: [!enableAppToAppPersonFlow],
    })
    setEnableAppToAppPersonFlow((previousState) => !previousState)
  }

  const toggleTheme = () => {
    if (themeName === BCThemeNames.BCSC) {
      setTheme(BCThemeNames.BCWallet)
    } else {
      setTheme(BCThemeNames.BCSC)
    }
  }

  const toggleMode = () => {
    lockOutUser(LockoutReason.Timeout)
    setTheme(BCThemeNames.BCSC)
    dispatch({
      type: BCDispatchAction.UPDATE_MODE,
      payload: [Mode.BCSC],
    })
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']}>
      <SafeAreaModal
        visible={remoteLoggingWarningModalVisible}
        transparent={false}
        animationType={'fade'}
        onRequestClose={() => {
          return
        }}
      >
        <RemoteLogWarning onBackPressed={onRemoteLoggingBackPressed} onEnablePressed={onEnableRemoteLoggingPressed} />
      </SafeAreaModal>
      <SafeAreaModal
        visible={environmentModalVisible}
        transparent={false}
        animationType={'slide'}
        onRequestClose={() => {
          return
        }}
      >
        <IASEnvironment shouldDismissModal={shouldDismissModal} />
      </SafeAreaModal>
      <ScrollView style={styles.container}>
        <SectionRow
          title={t('Developer.DeveloperMode')}
          accessibilityLabel={t('Developer.Toggle')}
          testID={testIdWithKey('ToggleDeveloper')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={devMode ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleSwitch}
            value={devMode}
          />
        </SectionRow>
        <View style={styles.sectionSeparator}></View>
        <SectionHeader icon={'apartment'} title={'IAS'} />
        <SectionRow
          title={t('Developer.Environment')}
          accessibilityLabel={t('Developer.Environment')}
          testID={testIdWithKey(t('Developer.Environment').toLowerCase())}
          onPress={() => {
            setEnvironmentModalVisible(true)
          }}
        >
          <Text style={[TextTheme.headingFour, { fontWeight: 'normal', color: ColorPallet.brand.link }]}>
            {store.developer.environment.name}
          </Text>
        </SectionRow>
        <View style={styles.sectionSeparator}></View>
        <SectionRow
          title={t('Verifier.UseVerifierCapability')}
          accessibilityLabel={t('Verifier.Toggle')}
          testID={testIdWithKey('ToggleVerifierCapability')}
          showRowSeparator
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useVerifierCapability ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleVerifierCapabilitySwitch}
            value={useVerifierCapability}
          />
        </SectionRow>
        <SectionRow
          title={t('Verifier.AcceptDevCredentials')}
          accessibilityLabel={t('Verifier.Toggle')}
          testID={testIdWithKey('ToggleAcceptDevCredentials')}
          showRowSeparator
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={acceptDevCredentials ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleAcceptDevCredentialsSwitch}
            value={acceptDevCredentials}
          />
        </SectionRow>
        <SectionRow
          title={t('Connection.UseConnectionInviterCapability')}
          accessibilityLabel={t('Connection.Toggle')}
          testID={testIdWithKey('ToggleConnectionInviterCapabilitySwitch')}
          showRowSeparator
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useConnectionInviterCapability ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleConnectionInviterCapabilitySwitch}
            value={useConnectionInviterCapability}
          />
        </SectionRow>
        <SectionRow
          title={t('Verifier.UseDevVerifierTemplates')}
          accessibilityLabel={t('Verifier.ToggleDevTemplates')}
          testID={testIdWithKey('ToggleDevVerifierTemplatesSwitch')}
          showRowSeparator
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useDevVerifierTemplates ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleDevVerifierTemplatesSwitch}
            value={useDevVerifierTemplates}
          />
        </SectionRow>
        {!store.onboarding.didCreatePIN && (
          <SectionRow
            title={t('NameWallet.EnableWalletNaming')}
            accessibilityLabel={t('NameWallet.ToggleWalletNaming')}
            testID={testIdWithKey('ToggleWalletNamingSwitch')}
            showRowSeparator
          >
            <Switch
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={enableWalletNaming ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={toggleWalletNamingSwitch}
              value={enableWalletNaming}
            />
          </SectionRow>
        )}
        <SectionRow
          title={t('Settings.PreventAutoLock')}
          accessibilityLabel={t('Settings.TogglePreventAutoLock')}
          testID={testIdWithKey('TogglePreventAutoLockSwitch')}
          showRowSeparator
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={preventAutoLock ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={togglePreventAutoLockSwitch}
            value={preventAutoLock}
          />
        </SectionRow>
        <SectionRow
          title={'Remote Logging'}
          accessibilityLabel={'Remote Logging'}
          testID={testIdWithKey('ToggleRemoteLoggingSwitch')}
          subContent={
            remoteLoggingEnabled ? (
              <Text style={[styles.rowTitle, { marginTop: 10 }]}>
                {`${t('RemoteLogging.SessionID')}: `}
                <Text style={[styles.rowTitle, { fontWeight: 'bold' }]}>{logger.sessionId.toString()}</Text>
              </Text>
            ) : (
              <></>
            )
          }
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={remoteLoggingEnabled ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleRemoteLoggingSwitch}
            value={remoteLoggingEnabled}
          />
        </SectionRow>

        <SectionRow
          title={t('PasteUrl.UseShareableLink')}
          accessibilityLabel={t('PasteUrl.UseShareableLink')}
          testID={testIdWithKey('ToggleUseShareableLink')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={enableShareableLink ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleShareableLinkSwitch}
            value={enableShareableLink}
            disabled={!store.authentication.didAuthenticate}
          />
        </SectionRow>

        <SectionRow
          title={t('Developer.EnableProxy')}
          accessibilityLabel={t('Developer.EnableProxy')}
          testID={testIdWithKey('ToggleEnableProxy')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={enableProxy ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleEnableProxySwitch}
            value={enableProxy}
          />
        </SectionRow>

        <SectionRow
          title={t('Developer.EnableAltPersonFlow')}
          accessibilityLabel={t('Developer.EnableAltPersonFlow')}
          testID={testIdWithKey('ToggleEnableAltPersonFlow')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={enableAltPersonFlow ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleEnableAltPersonFlowSwitch}
            value={enableAltPersonFlow}
          />
        </SectionRow>

        <SectionRow
          title={t('Developer.EnableAppToAppPersonFlow')}
          accessibilityLabel={t('Developer.EnableAppToAppPersonFlow')}
          testID={testIdWithKey('ToggleEnableAppToAppPersonFlow')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={enableAppToAppPersonFlow ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleEnableAppToAppPersonFlowSwitch}
            value={enableAppToAppPersonFlow}
          />
        </SectionRow>

        <SectionRow
          title={t('Developer.SwitchTheme')}
          accessibilityLabel={t('Developer.SwitchTheme')}
          testID={testIdWithKey('ToggleTheme')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={themeName === BCThemeNames.BCSC ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleTheme}
            value={themeName === BCThemeNames.BCSC}
          />
        </SectionRow>

        <SectionRow
          title={t('Developer.SwitchMode')}
          accessibilityLabel={t('Developer.SwitchMode')}
          testID={testIdWithKey('ToggleMode')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleMode}
            value={false}
          />
        </SectionRow>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Developer
