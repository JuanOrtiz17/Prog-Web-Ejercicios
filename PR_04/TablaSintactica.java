package PR_04;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.HashMap;
import java.util.Map;

public class TablaSintactica extends JFrame {

    private final Map<Integer, int[]> syntacticTable;
    private JTextField tokenField;
    private JTextArea resultsArea;

    public TablaSintactica() {
        syntacticTable = new HashMap<>();
        syntacticTable.put(4, new int[]{301, 302, 304, 306, 308, 309, 311, 313, 316});
        syntacticTable.put(8, new int[]{305, 314, 315});
        syntacticTable.put(10, new int[]{300});
        syntacticTable.put(11, new int[]{303, 305});
        syntacticTable.put(12, new int[]{307, 309, 310});
        syntacticTable.put(13, new int[]{305, 314});
        syntacticTable.put(14, new int[]{305, 312, 317});
        syntacticTable.put(15, new int[]{305, 312, 317});
        syntacticTable.put(50, new int[]{303, 305, 307, 309});
        syntacticTable.put(51, new int[]{305});
        syntacticTable.put(53, new int[]{305, 307, 309, 310, 312});
        syntacticTable.put(54, new int[]{316});
        syntacticTable.put(61, new int[]{316, 319});
        syntacticTable.put(62, new int[]{318});
        syntacticTable.put(72, new int[]{301});
        syntacticTable.put(199, new int[]{303, 305, 307, 309, 310, 312});
        
        setTitle("Administrador de Tabla Sintáctica DML");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(600, 400);
        setLayout(new BorderLayout(10, 10));

        // Panel principal
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.Y_AXIS));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        mainPanel.setBackground(new Color(244, 244, 244));

        // Panel del contenedor
        JPanel containerPanel = new JPanel();
        containerPanel.setLayout(new BoxLayout(containerPanel, BoxLayout.Y_AXIS));
        containerPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        containerPanel.setBackground(Color.WHITE);
        containerPanel.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(230, 230, 230)),
            BorderFactory.createEmptyBorder(10, 10, 10, 10)));

        // Título
        JLabel titleLabel = new JLabel("Tabla Sintáctica DML");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 20));
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        containerPanel.add(titleLabel);
        containerPanel.add(Box.createVerticalStrut(20));

        // Módulo de entrada
        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new BoxLayout(inputPanel, BoxLayout.Y_AXIS));
        inputPanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        tokenField = new JTextField();
        tokenField.setMaximumSize(new Dimension(400, 30));
        tokenField.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(Color.GRAY),
            BorderFactory.createEmptyBorder(5, 5, 5, 5)));
        
        JLabel inputLabel = new JLabel("Ingrese token");
        inputPanel.add(inputLabel);
        inputPanel.add(Box.createVerticalStrut(5));
        inputPanel.add(tokenField);
        inputPanel.add(Box.createVerticalStrut(15));

        JButton analyzeButton = new JButton("Analizar");
        analyzeButton.setAlignmentX(Component.CENTER_ALIGNMENT);
        analyzeButton.setBackground(new Color(0, 123, 255));
        analyzeButton.setForeground(Color.WHITE);
        analyzeButton.setBorderPainted(false);
        analyzeButton.setFocusPainted(false);
        analyzeButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handleTokenAnalysis();
            }
        });
        inputPanel.add(analyzeButton);
        
        containerPanel.add(inputPanel);
        containerPanel.add(Box.createVerticalStrut(30));

        // Módulo de resultados
        JPanel resultsPanel = new JPanel();
        resultsPanel.setLayout(new BoxLayout(resultsPanel, BoxLayout.Y_AXIS));
        resultsPanel.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(238, 238, 238)),
            BorderFactory.createEmptyBorder(15, 0, 0, 0)));
        
        JLabel resultsTitle = new JLabel("Resultado");
        resultsTitle.setFont(new Font("Arial", Font.BOLD, 16));
        resultsTitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        resultsPanel.add(resultsTitle);
        resultsPanel.add(Box.createVerticalStrut(10));

        resultsArea = new JTextArea();
        resultsArea.setEditable(false);
        resultsArea.setLineWrap(true);
        resultsArea.setWrapStyleWord(true);
        resultsArea.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(238, 238, 238)),
            BorderFactory.createEmptyBorder(10, 10, 10, 10)));
        JScrollPane resultsScroll = new JScrollPane(resultsArea);
        resultsScroll.setPreferredSize(new Dimension(500, 150));
        resultsScroll.setMaximumSize(new Dimension(500, 150));
        resultsPanel.add(resultsScroll);
        
        containerPanel.add(resultsPanel);
        mainPanel.add(containerPanel);
        add(mainPanel, BorderLayout.CENTER);

        // Centrar la ventana
        setLocationRelativeTo(null);
    }

    private void handleTokenAnalysis() {
        try {
            String tokenText = tokenField.getText();
            if (tokenText.isEmpty()) {
                resultsArea.setText("Por favor ingrese un token válido");
                return;
            }

            int token = Integer.parseInt(tokenText);
            int[] rules = syntacticTable.getOrDefault(token, new int[0]);

            if (rules.length == 0) {
                resultsArea.setText("No se encontraron reglas asociadas para este token.");
            } else {
                StringBuilder sb = new StringBuilder();
                for (int rule : rules) {
                    sb.append("• ").append(rule).append("\n");
                }
                resultsArea.setText(sb.toString());
            }
        } catch (NumberFormatException ex) {
            resultsArea.setText("Por favor ingrese un token válido (número entero)");
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            TablaSintactica manager = new TablaSintactica();
            manager.setVisible(true);
        });
    }
}