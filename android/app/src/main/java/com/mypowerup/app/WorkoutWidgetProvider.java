package com.mypowerup.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;

public class WorkoutWidgetProvider extends AppWidgetProvider {

    public static void updateAllWidgets(
        Context context,
        String exerciseName,
        int currentSet,
        int totalSets,
        int reps,
        double weight,
        boolean isResting,
        int restSeconds
    ) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, WorkoutWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);

        if (appWidgetIds == null || appWidgetIds.length == 0) return;

        String weightStr = (weight % 1 == 0) ? String.valueOf((int) weight) : String.valueOf(weight);

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_workout_home);

            views.setTextViewText(R.id.tv_widget_exercise_name, exerciseName);
            views.setTextViewText(R.id.tv_widget_set_number, currentSet + "/" + totalSets);
            views.setTextViewText(R.id.tv_widget_reps, reps + "r");
            views.setTextViewText(R.id.tv_widget_weight, weightStr + "kg");

            if (isResting) {
                views.setViewVisibility(R.id.tv_widget_rest, View.VISIBLE);
                views.setTextViewText(R.id.tv_widget_rest, "⏱ Descanso: " + restSeconds + "s");
                views.setViewVisibility(R.id.tv_widget_status, View.GONE);
            } else {
                views.setViewVisibility(R.id.tv_widget_rest, View.GONE);
                views.setViewVisibility(R.id.tv_widget_status, View.VISIBLE);
                views.setTextViewText(R.id.tv_widget_status, "Toca '+' para registrar serie");
            }

            // Acciones interactivas directas desde el widget
            views.setOnClickPendingIntent(R.id.btn_widget_add_set, createPendingBroadcast(context, LockscreenPlugin.ACTION_COMPLETE_SET, 301));
            views.setOnClickPendingIntent(R.id.btn_widget_reps_minus, createPendingBroadcast(context, LockscreenPlugin.ACTION_SUB_REPS, 302));
            views.setOnClickPendingIntent(R.id.btn_widget_reps_plus, createPendingBroadcast(context, LockscreenPlugin.ACTION_ADD_REPS, 303));
            views.setOnClickPendingIntent(R.id.btn_widget_weight_minus, createPendingBroadcast(context, LockscreenPlugin.ACTION_SUB_WEIGHT_1KG, 304));
            views.setOnClickPendingIntent(R.id.btn_widget_weight_plus, createPendingBroadcast(context, LockscreenPlugin.ACTION_ADD_WEIGHT_1KG, 305));
            views.setOnClickPendingIntent(R.id.btn_widget_finish, createPendingBroadcast(context, LockscreenPlugin.ACTION_STOP_WORKOUT, 306));

            // Abrir la app al tocar el fondo del widget
            Intent appIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (appIntent != null) {
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, appIntent, flags);
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
            }

            appWidgetManager.updateAppWidget(widgetId, views);
        }
    }

    private static PendingIntent createPendingBroadcast(Context context, String action, int requestCode) {
        Intent intent = new Intent(action);
        intent.setPackage(context.getPackageName());
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, requestCode, intent, flags);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        super.onUpdate(context, appWidgetManager, appWidgetIds);
    }
}
