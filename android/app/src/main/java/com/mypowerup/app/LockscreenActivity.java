package com.mypowerup.app;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.lang.ref.WeakReference;

public class LockscreenActivity extends Activity {

    private static WeakReference<LockscreenActivity> activeInstance = null;

    private TextView tvExerciseName;
    private ImageView ivExercise;
    private TextView tvSerieNumbers;
    private TextView tvRepsVal;
    private TextView tvWeightVal;
    private LinearLayout layoutRestTimer;
    private TextView tvRestTimer;

    // Estado en memoria
    public static String sExerciseName = "Ejercicio";
    public static int sCurrentSet = 1;
    public static int sTotalSets = 4;
    public static int sReps = 10;
    public static double sWeight = 8.0;
    public static boolean sIsResting = false;
    public static int sRestSeconds = 0;
    public static Bitmap sExerciseBitmap = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        activeInstance = new WeakReference<>(this);

        // Permitir mostrar sobre la pantalla de bloqueo
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        setContentView(R.layout.activity_lockscreen_widget);

        // Vistas
        tvExerciseName = findViewById(R.id.tv_exercise_name);
        ivExercise = findViewById(R.id.iv_exercise);
        tvSerieNumbers = findViewById(R.id.tv_serie_numbers);
        tvRepsVal = findViewById(R.id.tv_reps_val);
        tvWeightVal = findViewById(R.id.tv_weight_val);
        layoutRestTimer = findViewById(R.id.layout_rest_timer);
        tvRestTimer = findViewById(R.id.tv_rest_timer);

        // Tocar afuera del cuadrado para desbloquear el celular
        View rootLayout = findViewById(R.id.layout_lockscreen_root);
        rootLayout.setOnClickListener(v -> dismissKeyguardAndFinish());

        // Botón superior de desbloquear
        View btnUnlock = findViewById(R.id.btn_unlock_screen);
        btnUnlock.setOnClickListener(v -> dismissKeyguardAndFinish());

        // Evitar que hacer clic dentro del cuadrado cierre el overlay
        View cardWidget = findViewById(R.id.card_lockscreen_widget);
        cardWidget.setOnClickListener(v -> {
            // Consumir el clic dentro del cuadrado
        });

        // Botón '+' Serie
        findViewById(R.id.btn_add_serie).setOnClickListener(v -> {
            LockscreenPlugin.dispatchActionDirectly(LockscreenPlugin.ACTION_COMPLETE_SET);
        });

        // Botón '-' Repes
        findViewById(R.id.btn_reps_minus).setOnClickListener(v -> {
            LockscreenPlugin.dispatchActionDirectly(LockscreenPlugin.ACTION_SUB_REPS);
        });

        // Botón '+' Repes
        findViewById(R.id.btn_reps_plus).setOnClickListener(v -> {
            LockscreenPlugin.dispatchActionDirectly(LockscreenPlugin.ACTION_ADD_REPS);
        });

        // Botón '-' Peso
        findViewById(R.id.btn_weight_minus).setOnClickListener(v -> {
            LockscreenPlugin.dispatchActionDirectly(LockscreenPlugin.ACTION_SUB_WEIGHT_1KG);
        });

        // Botón '+' Peso
        findViewById(R.id.btn_weight_plus).setOnClickListener(v -> {
            LockscreenPlugin.dispatchActionDirectly(LockscreenPlugin.ACTION_ADD_WEIGHT_1KG);
        });

        // Botón Saltar descanso
        findViewById(R.id.btn_skip_rest).setOnClickListener(v -> {
            LockscreenPlugin.dispatchActionDirectly(LockscreenPlugin.ACTION_SKIP_REST);
        });

        // Botón Terminar
        findViewById(R.id.btn_finish_workout).setOnClickListener(v -> {
            LockscreenPlugin.dispatchActionDirectly(LockscreenPlugin.ACTION_STOP_WORKOUT);
            finish();
        });

        updateUI();
    }

    private void dismissKeyguardAndFinish() {
        try {
            KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (km != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                km.requestDismissKeyguard(this, null);
            }
        } catch (Exception ignored) {}
        finish();
    }

    public static void updateData(
        String exerciseName,
        int currentSet,
        int totalSets,
        int reps,
        double weight,
        boolean isResting,
        int restSeconds,
        Bitmap bitmap
    ) {
        sExerciseName = exerciseName;
        sCurrentSet = currentSet;
        sTotalSets = totalSets;
        sReps = reps;
        sWeight = weight;
        sIsResting = isResting;
        sRestSeconds = restSeconds;
        if (bitmap != null) {
            sExerciseBitmap = bitmap;
        }

        if (activeInstance != null) {
            LockscreenActivity act = activeInstance.get();
            if (act != null && !act.isFinishing()) {
                act.runOnUiThread(act::updateUI);
            }
        }
    }

    private void updateUI() {
        if (tvExerciseName != null) tvExerciseName.setText(sExerciseName);

        String weightStr = (sWeight % 1 == 0) ? String.valueOf((int) sWeight) : String.valueOf(sWeight);
        if (tvWeightVal != null) tvWeightVal.setText(weightStr + "kg");

        if (tvRepsVal != null) tvRepsVal.setText(sReps + " reps");

        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= sCurrentSet; i++) {
            sb.append(i).append("  ");
        }
        if (tvSerieNumbers != null) tvSerieNumbers.setText(sb.toString().trim());

        if (layoutRestTimer != null && tvRestTimer != null) {
            if (sIsResting) {
                layoutRestTimer.setVisibility(View.VISIBLE);
                tvRestTimer.setText("⏱ Descanso: " + sRestSeconds + "s");
            } else {
                layoutRestTimer.setVisibility(View.GONE);
            }
        }

        if (ivExercise != null && sExerciseBitmap != null) {
            ivExercise.setImageBitmap(sExerciseBitmap);
        }
    }

    public static void closeIfOpen() {
        if (activeInstance != null) {
            LockscreenActivity act = activeInstance.get();
            if (act != null && !act.isFinishing()) {
                act.runOnUiThread(act::finish);
            }
        }
    }

    @Override
    protected void onDestroy() {
        if (activeInstance != null && activeInstance.get() == this) {
            activeInstance = null;
        }
        super.onDestroy();
    }
}
