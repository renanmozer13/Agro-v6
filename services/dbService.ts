
import { supabase } from './supabaseClient';
import { 
  IdentifiedPlant, 
  CropPlan, 
  ProfessionalClient, 
  ProfessionalPrescription, 
  SeasonalRecommendation, 
  ConsumerProduct,
  NutritionPlan
} from '../types';

export const dbService = {
  /**
   * Faz upload de uma imagem base64 para o storage e retorna a URL pública.
   */
  async uploadImage(base64: string, fileName: string): Promise<string | null> {
    try {
      // Converte base64 para Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const filePath = `diagnosticos/${Date.now()}_${fileName}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('fotos-lavoura')
        .upload(filePath, blob);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('fotos-lavoura')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      return null;
    }
  },

  /**
   * Salva o diagnóstico de uma planta.
   */
  async savePlantDiagnosis(plant: Omit<IdentifiedPlant, 'id'>): Promise<IdentifiedPlant | null> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .insert([
          {
            common_name: plant.commonName,
            scientific_name: plant.scientificName,
            date: plant.date,
            image_url: plant.imageUrl,
            health_status: plant.healthStatus,
            diagnosis_summary: plant.diagnosisSummary,
            full_diagnosis: plant.fullDiagnosis,
            confidence: plant.confidence,
            location: plant.location
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao salvar planta no Supabase:", error);
      return null;
    }
  },

  /**
   * Busca o histórico de plantas identificadas.
   */
  async getPlantHistory(): Promise<IdentifiedPlant[]> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map((r: any) => ({
        id: r.id.toString(),
        commonName: r.common_name,
        scientificName: r.scientific_name,
        date: new Date(r.date).toLocaleDateString('pt-BR'),
        imageUrl: r.image_url,
        healthStatus: r.health_status,
        diagnosisSummary: r.diagnosis_summary,
        fullDiagnosis: r.full_diagnosis,
        confidence: r.confidence,
        location: r.location
      }));
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  },

  /**
   * Salva um plano de safra.
   */
  async saveCropPlan(plan: CropPlan): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('crop_plans')
        .insert([
          {
            crop_name: plan.cropName,
            data: plan
          }
        ]);
      return !error;
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      return false;
    }
  },

  // --- PROFESSIONAL HUB METHODS ---

  async getProfessionalClients(professionalId: string): Promise<ProfessionalClient[]> {
    try {
      const { data, error } = await supabase
        .from('professional_clients')
        .select('*')
        .eq('professional_id', professionalId);
      if (error) throw error;
      return data.map(r => ({
        id: r.id,
        name: r.name,
        goal: r.goal,
        lastUpdate: r.last_update,
        status: r.status,
        score: r.score,
        professionalId: r.professional_id
      }));
    } catch (error) {
      console.error("Error fetching professional clients:", error);
      return [];
    }
  },

  async saveProfessionalPrescription(prescription: Omit<ProfessionalPrescription, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('professional_prescriptions')
        .insert([{
          client_id: prescription.clientId,
          professional_id: prescription.professionalId,
          title: prescription.title,
          description: prescription.description,
          items: prescription.items
        }]);
      return !error;
    } catch (error) {
      console.error("Error saving prescription:", error);
      return false;
    }
  },

  async getSeasonalRecommendations(): Promise<SeasonalRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('seasonal_recommendations')
        .select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching seasonal recommendations:", error);
      return [];
    }
  },

  // --- CONSUMER HUB METHODS ---

  async getConsumerProducts(): Promise<ConsumerProduct[]> {
    try {
      const { data, error } = await supabase
        .from('consumer_products')
        .select('*');
      if (error) throw error;
      return data.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        producer: r.producer,
        rating: r.rating,
        category: r.category,
        isOrganic: r.is_organic
      }));
    } catch (error) {
      console.error("Error fetching consumer products:", error);
      return [];
    }
  },

  async saveNutritionPlan(plan: Omit<NutritionPlan, 'id'>, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nutrition_plans')
        .insert([{
          user_id: userId,
          title: plan.title,
          goal: plan.goal,
          daily_meals: plan.dailyMeals,
          seasonal_focus: plan.seasonalFocus
        }]);
      return !error;
    } catch (error) {
      console.error("Error saving nutrition plan:", error);
      return false;
    }
  }
};
