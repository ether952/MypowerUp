package com.mypowerup.app;

import android.app.KeyguardManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "LockscreenManager")
public class LockscreenPlugin extends Plugin {
    public static final String CHANNEL_ID = "mypowerup_workout_live_channel";
    public static final int NOTIFICATION_ID = 2026;

    public static final String ACTION_COMPLETE_SET = "com.mypowerup.app.ACTION_COMPLETE_SET";
    public static final String ACTION_ADD_WEIGHT = "com.mypowerup.app.ACTION_ADD_WEIGHT";
    public static final String ACTION_SUB_WEIGHT = "com.mypowerup.app.ACTION_SUB_WEIGHT";
    public static final String ACTION_ADD_WEIGHT_1KG = "com.mypowerup.app.ACTION_ADD_WEIGHT_1KG";
    public static final String ACTION_SUB_WEIGHT_1KG = "com.mypowerup.app.ACTION_SUB_WEIGHT_1KG";
    public static final String ACTION_ADD_REPS = "com.mypowerup.app.ACTION_ADD_REPS";
    public static final String ACTION_SUB_REPS = "com.mypowerup.app.ACTION_SUB_REPS";
    public static final String ACTION_SKIP_REST = "com.mypowerup.app.ACTION_SKIP_REST";
    public static final String ACTION_STOP_WORKOUT = "com.mypowerup.app.ACTION_STOP_WORKOUT";

    private static LockscreenPlugin sInstance = null;

    private BroadcastReceiver actionReceiver;
    private BroadcastReceiver screenReceiver;
    private final ExecutorService imageExecutor = Executors.newSingleThreadExecutor();
    private String lastLoadedImageUrl = "";
    private Bitmap cachedExerciseBitmap = null;
    private boolean isWorkoutActive = false;

    @Override
    public void load() {
        super.load();
        sInstance = this;
        registerActionReceiver();
        registerScreenReceiver();

        // Asegurarse de cancelar cualquier notificación que haya quedado pendiente
        try {
            NotificationManagerCompat.from(getContext()).cancel(NOTIFICATION_ID);
        } catch (Exception ignored) {}
    }

    private void registerScreenReceiver() {
        if (screenReceiver != null) return;
        screenReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (Intent.ACTION_SCREEN_OFF.equals(intent.getAction())) {
                    if (isWorkoutActive) {
                        try {
                            Intent lockIntent = new Intent(context, LockscreenActivity.class);
                            lockIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                            context.startActivity(lockIntent);
                        } catch (Exception ignored) {}
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        try {
            getContext().registerReceiver(screenReceiver, filter);
        } catch (Exception ignored) {}
    }

    private void registerActionReceiver() {
        if (actionReceiver != null) return;

        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_COMPLETE_SET);
        filter.addAction(ACTION_ADD_WEIGHT);
        filter.addAction(ACTION_SUB_WEIGHT);
        filter.addAction(ACTION_ADD_WEIGHT_1KG);
        filter.addAction(ACTION_SUB_WEIGHT_1KG);
        filter.addAction(ACTION_ADD_REPS);
        filter.addAction(ACTION_SUB_REPS);
        filter.addAction(ACTION_SKIP_REST);
        filter.addAction(ACTION_STOP_WORKOUT);

        actionReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (action == null) return;

                vibrateBriefly();

                String mappedAction = "next_set";
                if (ACTION_STOP_WORKOUT.equals(action)) {
                    isWorkoutActive = false;
                    LockscreenActivity.closeIfOpen();
                    mappedAction = "stop_workout";
                } else if (ACTION_COMPLETE_SET.equals(action)) {
                    mappedAction = "next_set";
                } else if (ACTION_ADD_WEIGHT.equals(action)) {
                    mappedAction = "add_weight";
                } else if (ACTION_SUB_WEIGHT.equals(action)) {
                    mappedAction = "sub_weight";
                } else if (ACTION_ADD_WEIGHT_1KG.equals(action)) {
                    mappedAction = "add_weight_1kg";
                } else if (ACTION_SUB_WEIGHT_1KG.equals(action)) {
                    mappedAction = "sub_weight_1kg";
                } else if (ACTION_ADD_REPS.equals(action)) {
                    mappedAction = "add_reps";
                } else if (ACTION_SUB_REPS.equals(action)) {
                    mappedAction = "sub_reps";
                } else if (ACTION_SKIP_REST.equals(action)) {
                    mappedAction = "skip_rest";
                }

                dispatchActionToWeb(mappedAction);
            }
        };

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                getContext().registerReceiver(actionReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
            } else {
                getContext().registerReceiver(actionReceiver, filter);
            }
        } catch (Exception e) {
            try {
                getContext().registerReceiver(actionReceiver, filter);
            } catch (Exception ignored) {}
        }
    }

    public static void dispatchActionDirectly(String action) {
        if (sInstance != null) {
            sInstance.vibrateBriefly();

            String mappedAction = "next_set";
            if (ACTION_STOP_WORKOUT.equals(action)) {
                sInstance.isWorkoutActive = false;
                mappedAction = "stop_workout";
            } else if (ACTION_COMPLETE_SET.equals(action)) {
                mappedAction = "next_set";
            } else if (ACTION_ADD_WEIGHT_1KG.equals(action)) {
                mappedAction = "add_weight_1kg";
            } else if (ACTION_SUB_WEIGHT_1KG.equals(action)) {
                mappedAction = "sub_weight_1kg";
            } else if (ACTION_ADD_REPS.equals(action)) {
                mappedAction = "add_reps";
            } else if (ACTION_SUB_REPS.equals(action)) {
                mappedAction = "sub_reps";
            } else if (ACTION_SKIP_REST.equals(action)) {
                mappedAction = "skip_rest";
            }

            sInstance.dispatchActionToWeb(mappedAction);
        }
    }

    private void vibrateBriefly() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vm = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                if (vm != null) {
                    vm.getDefaultVibrator().vibrate(VibrationEffect.createOneShot(45, VibrationEffect.DEFAULT_AMPLITUDE));
                }
            } else {
                Vibrator v = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(45, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(45);
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    private void dispatchActionToWeb(String mappedAction) {
        JSObject ret = new JSObject();
        ret.put("action", mappedAction);
        notifyListeners("workoutAction", ret);

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                try {
                    getBridge().getWebView().evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('workoutNativeAction', { detail: { action: '" + mappedAction + "' } }));",
                        null
                    );
                } catch (Exception ignored) {}
            });
        }
    }

    @PluginMethod
    public void updateNotification(PluginCall call) {
        String exerciseName = call.getString("exerciseName", "Ejercicio");
        int currentSet = call.getInt("currentSet", 1);
        int totalSets = call.getInt("totalSets", 4);
        double weight = call.getDouble("weight", 8.0);
        int reps = call.getInt("reps", 10);
        boolean isResting = call.getBoolean("isResting", false);
        int restSeconds = call.getInt("restSeconds", 0);
        String imageUrl = call.getString("imageUrl", "");

        isWorkoutActive = true;

        try {
            Context ctx = getContext();

            // CANCELAR Y ELIMINAR CUALQUIER NOTIFICACIÓN DE LA BARRA DE ESTADO (Cero notificaciones molestas)
            try {
                NotificationManagerCompat.from(ctx).cancel(NOTIFICATION_ID);
            } catch (Exception ignored) {}

            // Actualizar la pantalla de bloqueo transparente (El cuadrado con los datos)
            LockscreenActivity.updateData(
                exerciseName,
                currentSet,
                totalSets,
                reps,
                weight,
                isResting,
                restSeconds,
                cachedExerciseBitmap
            );

            // Actualizar el widget de pantalla de inicio (AppWidget)
            try {
                WorkoutWidgetProvider.updateAllWidgets(ctx, exerciseName, currentSet, totalSets, reps, weight, isResting, restSeconds);
            } catch (Exception ignored) {}

            // Si hay una imagen nueva, descargarla para la miniatura
            if (imageUrl != null && !imageUrl.isEmpty() && !imageUrl.equals(lastLoadedImageUrl) && imageUrl.startsWith("http")) {
                lastLoadedImageUrl = imageUrl;
                imageExecutor.execute(() -> {
                    try {
                        URL url = new URL(imageUrl);
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setConnectTimeout(3000);
                        conn.setReadTimeout(3000);
                        conn.setDoInput(true);
                        conn.connect();
                        InputStream input = conn.getInputStream();
                        Bitmap decoded = BitmapFactory.decodeStream(input);
                        if (decoded != null) {
                            cachedExerciseBitmap = decoded;
                            LockscreenActivity.updateData(
                                exerciseName,
                                currentSet,
                                totalSets,
                                reps,
                                weight,
                                isResting,
                                restSeconds,
                                cachedExerciseBitmap
                            );
                        }
                    } catch (Exception ignored) {}
                });
            }

            call.resolve();
        } catch (Exception e) {
            call.reject("Error actualizando widget", e);
        }
    }

    @PluginMethod
    public void cancelNotification(PluginCall call) {
        isWorkoutActive = false;
        try {
            NotificationManagerCompat.from(getContext()).cancel(NOTIFICATION_ID);
        } catch (Exception ignored) {}
        LockscreenActivity.closeIfOpen();
        call.resolve();
    }

    @PluginMethod
    public void vibrateAlert(PluginCall call) {
        try {
            Context ctx = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vm = (VibratorManager) ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                if (vm != null) {
                    long[] timings = new long[]{0, 350, 150, 350, 150, 500};
                    int[] amplitudes = new int[]{0, 255, 0, 255, 0, 255};
                    vm.getDefaultVibrator().vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1));
                }
            } else {
                Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createWaveform(new long[]{0, 350, 150, 350, 150, 500}, -1));
                    } else {
                        v.vibrate(new long[]{0, 350, 150, 350, 150, 500}, -1);
                    }
                }
            }
        } catch (Exception ignored) {}
        call.resolve();
    }

    @PluginMethod
    public void setLockscreenVisibility(PluginCall call) {
        boolean enable = call.getBoolean("enable", true);
        isWorkoutActive = enable;
        if (!enable) {
            LockscreenActivity.closeIfOpen();
        } else {
            // Si la pantalla ya está bloqueada/apagada al activar, abrir el overlay
            try {
                KeyguardManager km = (KeyguardManager) getContext().getSystemService(Context.KEYGUARD_SERVICE);
                if (km != null && km.isKeyguardLocked()) {
                    Intent lockIntent = new Intent(getContext(), LockscreenActivity.class);
                    lockIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    getContext().startActivity(lockIntent);
                }
            } catch (Exception ignored) {}
        }
        call.resolve();
    }

    @PluginMethod
    public void enterPip(PluginCall call) {
        android.app.Activity activity = getActivity();
        if (activity != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            activity.runOnUiThread(() -> {
                try {
                    android.app.PictureInPictureParams.Builder builder = new android.app.PictureInPictureParams.Builder();
                    activity.enterPictureInPictureMode(builder.build());
                } catch (Exception ignored) {}
            });
        }
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        isWorkoutActive = false;
        LockscreenActivity.closeIfOpen();
        if (actionReceiver != null) {
            try {
                getContext().unregisterReceiver(actionReceiver);
            } catch (Exception ignored) {}
            actionReceiver = null;
        }
        if (screenReceiver != null) {
            try {
                getContext().unregisterReceiver(screenReceiver);
            } catch (Exception ignored) {}
            screenReceiver = null;
        }
        imageExecutor.shutdown();
        super.handleOnDestroy();
    }
}
